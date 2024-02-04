// 定义 searchStock 函数
function searchStock() {
    // 获取输入框的值
    const symbol = document.getElementById('searchInput').value;
    // 构建 API 请求 URL（这里使用了股票行情的示例）
    const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0`;

    // 发送 API 请求
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => displayStockResult(data))
        .catch(error => console.error('Error:', error));
}

// 定义显示股票行情结果的函数
function displayStockResult(data) {
    // 清空结果容器
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';

    // 显示股票行情
    const resultElement = document.createElement('div');
    resultElement.innerHTML = `<p>股票符号: ${data.symbol}</p>
                               <p>最新价格: ${data.c}</p>
                               <p>昨日收盘价: ${data.pc}</p>
                               <p>涨跌额: ${data.d}</p>
                               <p>涨跌百分比: ${data.dp}%</p>`;

    resultContainer.appendChild(resultElement);
}