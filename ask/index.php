<?php
declare(strict_types=1);
require __DIR__.'/core.php';
require __DIR__.'/popularity.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function reply(array $data,int $status=200): void {
    global $q,$cfg,$db;
    if ($status===200 && isset($q,$cfg)) trackQuestion($data,$q,$cfg,$db ?? null);
    http_response_code($status);
    echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if ($_SERVER['REQUEST_METHOD']!=='POST') { header('Allow: POST'); reply(['error'=>'Send a question using the form.'],405); }
if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''),'application/json')) reply(['error'=>'A JSON question is required.'],415);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>4096) reply(['error'=>'Please shorten your question.'],413);
$raw=file_get_contents('php://input',false,null,0,4097);
if (strlen($raw)>4096) reply(['error'=>'Please shorten your question.'],413);
$data=json_decode($raw,true);
// Opening an accordion records a read of an approved ID and never calls a provider.
if (isset($data['openedFaq'])) {
    if (!is_string($data['openedFaq'])) reply(['error'=>'Unknown question.'],400);
    foreach (libraryRecords() as $r) {
        if (isset($r['question']) && $data['openedFaq']===$r['id']) {
            trackQuestion(['faqId'=>$r['id']],$r['question'],settings(),null);
            reply(['ok'=>true]);
        }
    }
    reply(['error'=>'Unknown question.'],404);
}
$q=is_string($data['question'] ?? null) ? trim($data['question']) : '';
if (mb_strlen($q)<3 || mb_strlen($q)>400) reply(['error'=>'Enter a question between 3 and 400 characters.'],400);
try {
    $records=libraryRecords();
    $normalized=normalize($q);
    if (!$normalized) reply(['error'=>'Please enter a question.'],400);
    $cfg=settings();
    $saved=exactAnswer($records,$normalized);
    if ($saved) reply($saved);
    $fallback=['kind'=>'related','answer'=>'I don’t have a confirmed answer to that question yet.','sources'=>related($records,$q)];
    if (empty($cfg['db']) || empty($cfg['cohere_key'])) reply($fallback);
    $db=database($cfg);
    // Only use the preceding turn for a question that refers back to it.
    $previous=$data['previousQuestion'] ?? '';
    $refersBack=is_string($previous) && trim($previous)!=='' && mb_strlen($previous)<=400
        && preg_match('/\b(it|that|those|these|they|them|this|there|one|also)\b|^(and|what about|how about)\b/iu',$q);
    $lookup=$refersBack ? "Previous question: ".$previous."\nCurrent question: ".$q : $q;
    $digest=hash_hmac('sha256',hash_file('sha256',__DIR__.'/index-data.json').'|'.$cfg['model'].'|chat6-layout|'.mb_strtolower($lookup),$cfg['salt']);
    $read=$db->prepare('SELECT reply FROM qa_cache WHERE digest=? AND expires>UNIX_TIMESTAMP()'); $read->execute([$digest]);
    if ($cached=$read->fetchColumn()) reply(json_decode($cached,true));
    $live=array_column($records,null,'id');
    $rows=[];
    foreach ($db->query('SELECT id,signature,embedding FROM qa_documents WHERE embedding IS NOT NULL') as $row) {
        if (isset($live[$row['id']]) && hash_equals(vectorKey($live[$row['id']]),$row['signature'])) $rows[]=$row;
    }
    if (!$rows) reply($fallback);
    $session=$_COOKIE['sonaway_qa'] ?? '';
    if (!is_string($session) || !preg_match('/^[a-f0-9]{32}$/D',$session)) {
        $session=bin2hex(random_bytes(16));
        setcookie('sonaway_qa',$session,['expires'=>time()+86400,'path'=>'/ask','secure'=>true,'httponly'=>true,'samesite'=>'Lax']);
    }
    $ip=hash_hmac('sha256',$_SERVER['REMOTE_ADDR'] ?? 'unknown',$cfg['salt']);
    $t=time(); $m=intdiv($t,60); $d=intdiv($t,86400); $tomorrow=($d+1)*86400;
    $global=['paid:'.$d=>[(int)$cfg['daily_calls'],$tomorrow]];
    $limits=['session:'.$session.':'.$m=>[5,($m+1)*60],'ip:'.$ip.':'.$m=>[20,($m+1)*60],
        'ip-day:'.$ip.':'.$d=>[80,$tomorrow]];
    $limitReply=['kind'=>'limit','answer'=>'Live search has reached its limit. You can still open the common questions or contact Sonaway.','sources'=>$fallback['sources']];
    if (!reserve($db,$limits+$global)) reply($limitReply,429);
    $vector=embeddings($cfg['cohere_key'],[$lookup],'search_query')[0];
    $rank=[];
    foreach ($rows as $row) {
        $v=array_values(unpack('g*',$row['embedding']));
        if (count($v)!==EMBED_DIM) continue;
        $score=0.0; foreach ($v as $i=>$n) $score+=$n*$vector[$i];
        $rank[]=['score'=>$score,'record'=>$live[$row['id']]];
    }
    usort($rank,static fn($a,$b)=>$b['score']<=>$a['score']);
    if (!$rank || $rank[0]['score']<0.28) reply($fallback);
    $first=$rank[0]; $best=$first['record'];
    // Conservative reuse. New specific wording normally goes to grounded synthesis.
    if (!$refersBack && isset($best['question']) && $first['score']>=0.86 && $first['score']-($rank[1]['score'] ?? 0)>=0.06 && preg_match('/^[\x20-\x7e]+$/D',$q)) {
        $answer=savedAnswer($best);
    } else {
        if (empty($cfg['openrouter_key'])) reply($fallback);
        if (!reserve($db,$global)) reply($limitReply,429);
        $docs=array_column(array_slice($rank,0,6),'record');
        $answer=generation($cfg,$lookup,$docs);
        if (!$answer) reply($fallback);
    }
    $db->prepare('INSERT INTO qa_cache (digest,reply,expires) VALUES (?,?,?) ON DUPLICATE KEY UPDATE reply=VALUES(reply),expires=VALUES(expires)')
        ->execute([$digest,json_encode($answer,JSON_UNESCAPED_UNICODE),$t+86400]);
    reply($answer);
} catch (Throwable $e) {
    if (isset($fallback)) reply(['kind'=>'unavailable','answer'=>'Live answers are temporarily unavailable. You can still use the common questions.','sources'=>$fallback['sources']],503);
    reply(['error'=>'Please try again or use the common questions.'],503);
}
