<?php
declare(strict_types=1);

// Keep new free-form questions in finite topic buckets. Visitor wording never becomes public copy.
function questionTopic(string $q): string {
    $topics = [
        'pricing' => 'cost|costs|price|prices|pricing|budget|fee|fees|rates|expensive',
        'timeline' => 'timeline|turnaround|deadline|weeks|how long|how soon',
        'data-and-privacy' => 'privacy|confidential|confidentiality|security|secure|gdpr|retention',
        'existing-platforms' => 'integrate|integration|integrations|software|platform|hotelkit|confluence|trainual|sharepoint',
        'ownership' => 'own|owns|ownership|handoff|export|license',
        'languages' => 'language|languages|translation|translate|spanish|german|chinese',
        'training' => 'training|train|onboarding|hires|onboard',
        'capture' => 'record|recording|recordings|capture|documents|video|interview',
        'maintenance' => 'maintenance|maintain|updates|upkeep',
        'locations' => 'franchise|franchises|locations|branches',
        'getting-started' => 'pilot|discovery|start|started|begin',
    ];
    foreach ($topics as $name=>$pattern) {
        if (preg_match('/\b(?:'.$pattern.')\b/iu',$q)) return $name;
    }
    return 'other';
}

function trackQuestion(array $result, string $question, array $cfg, ?PDO $db): void {
    if (empty($cfg['db']) || ($_SERVER['HTTP_SEC_GPC'] ?? '')==='1' || ($_SERVER['HTTP_DNT'] ?? '')==='1') return;
    try {
        $db ??= database($cfg);
        $isFaq=isset($result['faqId']);
        $key=($isFaq ? 'faq:' : 'topic:').($isFaq ? $result['faqId'] : questionTopic($question));
        $now=time();
        $window=intdiv($now,600);
        $ip=$_SERVER['REMOTE_ADDR'] ?? '';
        $signature=substr(hash_hmac('sha256',implode('|',[$ip,substr($_SERVER['HTTP_USER_AGENT'] ?? '',0,200),$key,(string)$window]),$cfg['salt']),0,40);
        $network=substr(hash_hmac('sha256',$ip.'|'.$window,$cfg['salt']),0,40);
        $expires=($window+1)*600;
        if (!reserve($db,['qa-hit:'.$signature=>[1,$expires],'qa-traffic:'.$network=>[80,$expires]])) return;
        $write=$db->prepare('INSERT INTO qa_popularity (counter,total) VALUES (?,1) ON DUPLICATE KEY UPDATE total=total+1');
        $write->execute([$key]);
    } catch (Throwable $e) {
        // The visitor can still use saved answers during a database outage or migration.
    }
}

function rankedFaqs(array $records, array $counts): array {
    $faqs=[];
    foreach ($records as $r) {
        if (isset($r['question'])) $faqs[]=['id'=>$r['id'],'question'=>$r['question'],'answer'=>$r['answer'],'url'=>$r['url']];
    }
    // PHP 8's stable sort preserves the editorial order when totals tie.
    usort($faqs, static fn($a,$b)=>($counts['faq:'.$b['id']] ?? 0)<=>($counts['faq:'.$a['id']] ?? 0));
    return $faqs;
}
