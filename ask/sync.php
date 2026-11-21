<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__.'/core.php';
try {
    $cfg=settings();
    $db=database($cfg);
    if (!(int)$db->query("SELECT GET_LOCK('sonaway_public_qa_sync',0)")->fetchColumn()) exit;
    $db->exec("CREATE TABLE IF NOT EXISTS qa_documents (id VARCHAR(110) PRIMARY KEY, body MEDIUMTEXT NOT NULL, signature CHAR(64) NOT NULL, embedding MEDIUMBLOB NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $db->exec("CREATE TABLE IF NOT EXISTS qa_limits (bucket VARCHAR(120) PRIMARY KEY, used INT UNSIGNED NOT NULL, expires INT UNSIGNED NOT NULL, INDEX(expires)) ENGINE=InnoDB");
    $db->exec("CREATE TABLE IF NOT EXISTS qa_cache (digest CHAR(64) PRIMARY KEY, reply TEXT NOT NULL, expires INT UNSIGNED NOT NULL, INDEX(expires)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $records=libraryRecords();
    if (!$records) throw new RuntimeException('Empty source release');
    $db->beginTransaction();
    $save=$db->prepare('INSERT INTO qa_documents (id,body,signature) VALUES (?,?,?) ON DUPLICATE KEY UPDATE embedding=IF(signature=VALUES(signature),embedding,NULL), body=VALUES(body), signature=VALUES(signature)');
    foreach ($records as $r) $save->execute([$r['id'],json_encode($r,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),vectorKey($r)]);
    $marks=implode(',',array_fill(0,count($records),'?'));
    $db->prepare("DELETE FROM qa_documents WHERE id NOT IN ($marks)")->execute(array_column($records,'id'));
    $db->commit();
    $db->exec('DELETE FROM qa_limits WHERE expires < UNIX_TIMESTAMP()');
    $db->exec('DELETE FROM qa_cache WHERE expires < UNIX_TIMESTAMP()');
    $count=0;
    if (!empty($cfg['cohere_key'])) {
        $pending=$db->query('SELECT id,body,signature FROM qa_documents WHERE embedding IS NULL ORDER BY id')->fetchAll();
        $update=$db->prepare('UPDATE qa_documents SET embedding=? WHERE id=? AND signature=?');
        foreach(array_chunk($pending,32) as $batch) {
            $texts=array_map(static fn($row)=>indexText(json_decode($row['body'],true)), $batch);
            $vec=embeddings($cfg['cohere_key'],$texts,'search_document');
            foreach ($batch as $i=>$row) { $update->execute([pack('g*',...$vec[$i]),$row['id'],$row['signature']]); $count++; }
        }
    }
    echo count($records)." public records synced. ".$count." embeddings updated.\n";
} catch (Throwable $e) {
    fwrite(STDERR,"Sonaway Q&A sync incomplete (".get_class($e)."). Check private settings and provider availability.\n");
    exit(1);
}
