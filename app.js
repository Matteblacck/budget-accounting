document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    updateStatistics();

    // Обработчик для добавления нового расхода
    document.querySelector('.transaction-forms').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('transaction-name').value;
        const amount = document.getElementById('transaction-amount').value;
        const category = document.getElementById('transaction-category').value;
        addTransaction(name, amount, category);
        event.target.reset(); // Сбрасываем форму после добавления
    });

    // Переключение секций
    document.querySelectorAll('.section-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            showSection(button.dataset.section);
        });
    });

    // Обработчик для отображения расходов по выбранной категории
    const categorySelect = document.getElementById('transaction-category-stat');
    categorySelect.addEventListener('change', function () {
        updateCategoryExpense(this.value); // Обновляем статистику по выбранной категории
        updateTransactionTable(this.value); // Обновляем таблицу с транзакциями выбранной категории
    });

    // Инициализация начального состояния
    showSection('manage');
});







// Функция для показа выбранной секции
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('d-none', section.id !== sectionId);
    });
}

// Функция для обновления статистики по выбранной категории
function updateCategoryExpense(category) {
    // Вычисляем сумму для выбранной категории
    const categoryTotal = transactions
        .filter(transaction => transaction.category === category)
        .reduce((total, transaction) => total + transaction.amount, 0);

    // Находим или создаём элемент для отображения расходов по выбранной категории
    let categoryElement = document.getElementById('category-expense');
    if (!categoryElement) {
        categoryElement = document.createElement('div');
        categoryElement.id = 'category-expense';
        categoryElement.classList.add('category-expense');
        document.getElementById('stats').appendChild(categoryElement);
    }

    // Обновляем текст для выбранной категории
    categoryElement.textContent = `Расходы по категории ${category}: ${categoryTotal} ₽`;
}

// Функция для обновления таблицы с транзакциями выбранной категории
function updateTransactionTable(category) {
    const tableBody = document.getElementById('transaction-list-category');
    tableBody.innerHTML = ''; // Очищаем таблицу перед добавлением новых данных

    // Фильтруем транзакции по выбранной категории
    const filteredTransactions = transactions.filter(transaction => transaction.category === category);

    // Если транзакции для категории есть, добавляем их в таблицу
    if (filteredTransactions.length > 0) {
        filteredTransactions.forEach((transaction, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.name}</td>
                <td>${transaction.category}</td>
                <td>${transaction.amount} ₽</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        // Если нет транзакций для выбранной категории, показываем сообщение
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4">Нет транзакций для этой категории</td>`;
        tableBody.appendChild(row);
    }
}

// Данные и функции для управления расходами
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Обновление хранилища и перерисовка списка
function updateStorageAndRender() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactions();
    updateStatistics(); // Обновляем статистику
}

// Функция для добавления расхода
function addTransaction(name, amount, category) {
    const newTransaction = {
        date: new Date().toLocaleDateString(),
        name,
        amount: parseFloat(amount),
        category
    };
    transactions.push(newTransaction);
    updateStorageAndRender();
}

// Функция для удаления расхода
function deleteTransaction(index) {
    transactions.splice(index, 1);
    updateStorageAndRender();
}

// Функция для отображения списка расходов
function renderTransactions() {
    const transactionListElement = document.getElementById('transaction-list');
    transactionListElement.innerHTML = '';

    transactions.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.name}</td>
            <td>${transaction.category}</td>
            <td>${transaction.amount} ₽</td>
            <td><button class="btn btn-sm btn-light text-danger" onclick="deleteTransaction(${index})">Удалить</button></td>
        `;
        transactionListElement.prepend(row);
    });
}

// Функция для обновления статистики
function updateStatistics() {
    const totalExpense = transactions.reduce((total, transaction) => total + transaction.amount, 0);
    document.getElementById('total-expense').textContent = `${totalExpense}`;

    // Расчёт по категориям
    const categoryTotals = {
        'Рестораны и кафе': 0,
        'Продукты': 0,
        'Транспорт': 0,
        'Развлечения': 0
    };

    transactions.forEach(transaction => {
        if (categoryTotals[transaction.category] !== undefined) {
            categoryTotals[transaction.category] += transaction.amount;
        }
    });

    // Обновление значений категорий
    document.getElementById('rests-expense').querySelector('span').textContent = `${categoryTotals['Рестораны и кафе']} ₽`;
    document.getElementById('products-expense').querySelector('span').textContent = `${categoryTotals['Продукты']} ₽`;
    document.getElementById('transport-expense').querySelector('span').textContent = `${categoryTotals['Транспорт']} ₽`;
    document.getElementById('entertainment-expense').querySelector('span').textContent = `${categoryTotals['Развлечения']} ₽`;
}

//фильтрация
const filterBtn = document.getElementById('apply-filter')
filterBtn.addEventListener('click', () =>{
    const days = parseInt(document.getElementById('days-filter').value, 10);
    if (isNaN(days) || days < 1){
        alert('Введите корректное количество');
        return;
    }
    filterTransaction(days)
})

function filterTransaction(days){
    const today = new Date();
    const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date.split('.').reverse().join('-'));
        const diffTime = today - transactionDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24); // Конвертация в дни
        return diffDays <= days; // Возвращаем только транзакции, попадающие в диапазон
    });
    renderFilteredTransactions(filteredTransactions);

}

function renderFilteredTransactions(filteredTransactions) {
    const transactionListElement = document.getElementById('transaction-list');
    transactionListElement.innerHTML = ''; // Очищаем таблицу

    if (filteredTransactions.length === 0) {
        transactionListElement.innerHTML = `
            <tr>
                <td colspan="5">Нет транзакций за указанный период</td>
            </tr>
        `;
        return;
    }

    filteredTransactions.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.name}</td>
            <td>${transaction.category}</td>
            <td>${transaction.amount} ₽</td>
            <td><button class="btn btn-sm btn-light text-danger" onclick="deleteTransaction(${index})">Удалить</button></td>
        `;
        transactionListElement.prepend(row);
    });
}
//сброс фильтра
const deleteFilterBtn = document.getElementById('delete-filter')
deleteFilterBtn.addEventListener('click', () =>{
    renderTransactions(); // Отображаем все транзакции
    document.getElementById('days-filter').value = ''; // Очищаем поле ввода

})