<?php
declare(strict_types=1);
require __DIR__.'/core.php';
require __DIR__.'/popularity.php';
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=30');
$counts=[];
try {
    $db=database(settings());
    $counts=$db->query("SELECT counter,total FROM qa_popularity WHERE counter LIKE 'faq:%'")->fetchAll(PDO::FETCH_KEY_PAIR);
} catch (Throwable $e) {
    header('Cache-Control: no-store');
}
echo json_encode(rankedFaqs(libraryRecords(),$counts),JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
