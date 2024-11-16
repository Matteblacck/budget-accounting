// transactionList.js

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Функция для добавления транзакции
export function addTransaction(name, amount, category) {
    const newTransaction = {
        date: new Date(),
        name,
        amount,
        category
    };

    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactions();
}

// Функция для отображения транзакций
export function renderTransactions() {
    const transactionListElement = document.getElementById('transaction-list');
    transactionListElement.innerHTML = ''; // Очищаем список перед обновлением

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.name}</td>
            <td>${transaction.category}</td>xq
            <td>${transaction.amount}</td>
        `;
        transactionListElement.appendChild(row);
    });
}