<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__.'/../ask/core.php';
require __DIR__.'/../ask/popularity.php';

function check(bool $ok,string $what): void {
    if (!$ok) throw new RuntimeException($what);
}

$records=libraryRecords();
$default=rankedFaqs($records,[]);
$ranked=rankedFaqs($records,['faq:handoff'=>4,'faq:existing-tools'=>2,'topic:pricing'=>90]);
check($default[0]['id']==='faq-1','Default order');
check(array_column(array_slice($ranked,0,3),'id')===['handoff','existing-tools','faq-1'],'Frequency order and stable ties');
check(exactAnswer($records,normalize('Who owns the system?'))['faqId']==='handoff','Aliases share an ID');
check(questionTopic('Would a pilot fit my budget?')==='pricing','Aggregate free-form topic');
check(questionTopic('A private personal detail')==='other','Unknown topic');

// An optional test on the hosting server uses connection-local tables that shadow the live ones.
if (in_array('--database',$argv,true)) {
    $cfg=settings(); $db=database($cfg);
    $db->exec('CREATE TEMPORARY TABLE qa_limits LIKE qa_limits');
    $db->exec('CREATE TEMPORARY TABLE qa_popularity LIKE qa_popularity');
    $_SERVER['REMOTE_ADDR']='192.0.2.12'; $_SERVER['HTTP_USER_AGENT']='Sonaway test';
    $saved=exactAnswer($records,normalize('Who owns the system?'));
    trackQuestion($saved,'Who owns the system?',$cfg,$db);
    trackQuestion($saved,'Can we maintain it ourselves?',$cfg,$db);
    trackQuestion(['kind'=>'related'],'What is the price?',$cfg,$db);
    $_SERVER['HTTP_DNT']='1';
    trackQuestion(['faqId'=>'capture-inputs'],'Can we send voice notes?',$cfg,$db);
    $counts=$db->query('SELECT counter,total FROM qa_popularity')->fetchAll(PDO::FETCH_KEY_PAIR);
    check(count($counts)===2 && (int)$counts['faq:handoff']===1 && (int)$counts['topic:pricing']===1,'Deduplication, aggregation and privacy');
    check(rankedFaqs($records,$counts)[0]['id']==='handoff','Aggregated ranking');
}
echo "FAQ popularity checks passed.\n";
