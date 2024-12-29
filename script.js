const balance = document.querySelector("#balance");
const inc_amt = document.querySelector("#inc-amt");
const exp_amt = document.querySelector("#exp-amt");
const trans = document.querySelector("#trans");
const form = document.querySelector("#form");
const description = document.querySelector("#desc");
const amount = document.querySelector("#amount");
const filterRadios = document.querySelectorAll('input[name="filter"]');
const resetButton = document.querySelector("#reset-btn");

let isEditing = false;
let editId = null;

const localStorageTrans = JSON.parse(localStorage.getItem("trans"));
let transactions = localStorage.getItem("trans") !== null ? localStorageTrans : [];
let currentFilter = "all";

function loadTransactionDetails(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "exp" : "inc");
  item.innerHTML = `
    ${transaction.description}
    <span>${sign} ${Math.abs(transaction.amount)}</span>
    <button class="btn-edit" onclick="editTrans(${transaction.id})">Edit</button>
    <button class="btn-del" onclick="removeTrans(${transaction.id})">Delete</button>
  `;
  trans.appendChild(item);
}

function removeTrans(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions = transactions.filter((transaction) => transaction.id != id);
    config();
    updateLocalStorage();
  } else {
    return;
  }
}

function editTrans(id) {
  const transaction = transactions.find((trans) => trans.id === id);
  if (transaction) {
    description.value = transaction.description;
    amount.value = transaction.amount;
    isEditing = true;
    editId = id;
    form.querySelector("button[type='submit']").textContent = "Save Changes";
  }
}

function updateAmount() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  balance.innerHTML = `₹  ${total}`;

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);
  inc_amt.innerHTML = `₹  ${income}`;

  const expense = amounts
    .filter((item) => item < 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);
  exp_amt.innerHTML = `₹  ${Math.abs(expense)}`;
}

function config() {
  trans.innerHTML = "";
  const filteredTransactions = getFilteredTransactions(); 
  filteredTransactions.forEach(loadTransactionDetails); 
  updateAmount();
}

function addTransaction(e) {
  e.preventDefault();
  if (description.value.trim() === "" || amount.value.trim() === "") {
    alert("Please Enter Description and Amount");
  } else if (isEditing) {
    transactions = transactions.map((transaction) =>
      transaction.id === editId
        ? { ...transaction, description: description.value, amount: +amount.value }
        : transaction
    );
    isEditing = false;
    editId = null;
    form.querySelector("button[type='submit']").textContent = "Add Transaction";
  } else {
    const transaction = {
      id: uniqueId(),
      description: description.value,
      amount: +amount.value,
    };
    transactions.push(transaction);
  }
  description.value = ""; 
  amount.value = ""; 
  config();
  updateLocalStorage();
}

function resetForm() { 
  description.value = "";
  amount.value = ""; 
  isEditing = false; 
  editId = null; 
  form.querySelector("button[type='submit']").textContent = "Add Transaction";
} 

function uniqueId() {
  return Math.floor(Math.random() * 10000000);
}

function getFilteredTransactions() { 
  if (currentFilter === "income") { 
    return transactions.filter((transaction) => transaction.amount > 0);
  } else if (currentFilter === "expense") { 
    return transactions.filter((transaction) => transaction.amount < 0);
  } else { 
    return transactions;
  } 
}

function handleFilterChange(e) { 
  currentFilter = e.target.value;
  config(); 
} 

filterRadios.forEach((radio) => radio.addEventListener("change", handleFilterChange));

resetButton.addEventListener("click", resetForm); 

form.addEventListener("submit", addTransaction);

window.addEventListener("load", function () {
  config();
});

function updateLocalStorage() {
  localStorage.setItem("trans", JSON.stringify(transactions));
}
