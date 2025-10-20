const fs = require('fs');
const path = require('path');

// API에서 데이터를 가져오는 함수
async function fetchTransactionData(code) {
  try {
    const response = await fetch(`https://backend.dexrp.io/vending/handover?code=${code}`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${code}:`, error.message);
    return [];
  }
}

// 모든 코드 데이터 수집
async function collectAllData() {
  console.log('📡 코드 목록 로드 중...');
  const codesPath = path.join(__dirname, '../data/codes.json');
  const codes = JSON.parse(fs.readFileSync(codesPath, 'utf8'));

  console.log(`🚀 ${codes.length}개 코드의 데이터를 수집 중...`);

  const allTransactions = [];
  let successCount = 0;
  let failCount = 0;

  // 병렬로 처리 (배치별로)
  const batchSize = 10;
  for (let i = 0; i < codes.length; i += batchSize) {
    const batch = codes.slice(i, i + batchSize);
    console.log(`\n배치 ${Math.floor(i/batchSize) + 1}/${Math.ceil(codes.length/batchSize)} 처리 중...`);

    const promises = batch.map(async (code) => {
      console.log(`  → ${code.name} (${code.code})`);
      const transactions = await fetchTransactionData(code.code);

      if (transactions.length > 0) {
        console.log(`    ✅ ${transactions.length}건`);
        successCount++;
        return transactions;
      } else {
        console.log(`    ❌ 데이터 없음`);
        failCount++;
        return [];
      }
    });

    const results = await Promise.allSettled(promises);
    const batchData = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value);

    allTransactions.push(...batchData);

    // 배치 간 딜레이 (API 부하 방지)
    if (i + batchSize < codes.length) {
      console.log('  💤 2초 대기...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 데이터 저장
  const outputPath = path.join(__dirname, '../data/cached-transactions.json');
  const cacheData = {
    lastUpdated: new Date().toISOString(),
    totalCodes: codes.length,
    successfulFetches: successCount,
    failedFetches: failCount,
    totalTransactions: allTransactions.length,
    transactions: allTransactions
  };

  fs.writeFileSync(outputPath, JSON.stringify(cacheData, null, 2));

  console.log('\n📊 수집 완료!');
  console.log(`  ✅ 성공: ${successCount}개`);
  console.log(`  ❌ 실패: ${failCount}개`);
  console.log(`  📄 총 거래: ${allTransactions.length}건`);
  console.log(`  💾 저장: ${outputPath}`);
}

// 스크립트 실행
if (require.main === module) {
  collectAllData().catch(console.error);
}

module.exports = { collectAllData };