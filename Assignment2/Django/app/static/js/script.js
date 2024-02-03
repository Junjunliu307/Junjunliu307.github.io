document.addEventListener('DOMContentLoaded', function () {
    const stockForm = document.getElementById('stockForm');
    const resultContainer = document.getElementById('resultContainer');

    stockForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // 获取输入的股票符号
        const symbol = document.getElementById('symbol').value;

        // 构建 API 请求 URL
        const apiUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=cmvcithr01qog1iutdmgcmvcithr01qog1iutdn0`;

        // 发送 API 请求
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => search(data)) // 将函数名修改为 search
            .catch(error => console.error('Error:', error));
    });

    function search(data) { // 将函数名修改为 search
        // 清空结果容器
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
});