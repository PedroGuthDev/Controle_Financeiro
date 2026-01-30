//declaração das funções

//Cria um novo elemento Li para a lista de transações, adicionando as informações e alterando classes do css
function criarTransacaoElemento(transacao) {
  const li = document.createElement("li");
  li.classList.add("transaction-item", transacao.type);
  li.id = transacao.id;

  const description = document.createElement("h4");
  description.textContent = transacao.description;
  description.id = `description${transacao.id}`;

  const amount = document.createElement("h4");
  amount.textContent = transacao.amount;
  amount.classList.add("amount", transacao.type);
  amount.id = `amount${transacao.id}`;

  const type = document.createElement("h4");
  type.textContent = transacao.type;
  type.id = `type${transacao.id}`;

  const category = document.createElement("h4");
  category.textContent = transacao.category;
  category.id = `category${transacao.id}`;

  const date = document.createElement("h4");
  date.textContent = transacao.date;
  date.id = `date${transacao.id}`;

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-btn");
  editBtn.innerText = "🖊️";

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.innerText = "✖️";

  li.append(description, amount, type, category, date, editBtn, deleteBtn);
  document.querySelector("#transactionsList").appendChild(li);
}

//Utiliza o método GET para a API retornar todas as transações e passar para a função de criar elementos para
// adicionar isso no html.
async function getTransacoes() {
  try {
    const response = await fetch("http://localhost:3000/transacoes").then(
      (tr) => tr.json(),
    );
    // Limpo toda a UL para não criar elementos repetidos
    document.querySelector("#transactionsList").innerHTML = "";
    // Para cada transacao cria um elemento html
    response.forEach(criarTransacaoElemento);
    //Verifica se existe alguma transação e oculta a div que diz "nenhuma transação"
    if (response[0]) {
      document.getElementById("empty-message").style.display = "none";
    } else if (!response[0]) {
      document.getElementById("empty-message").style.display = "block";
    }
  } catch (err) {
    console.log(err);
  }
}

// Função para salvar uma nova transação utilizando o método POST ao dar submit no form
async function submitTransacao() {
  const transation = {
    description: document.getElementById("description").value,
    amount: document.getElementById("amount").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    //converto a data para formato brasileiro, dd-mm-yyyy
    date: new Date(document.getElementById("date").value).toLocaleDateString(
      "pt-BR",
      {
        timeZone: "UTC",
      },
    ),
  };

  try {
    const response = await fetch("http://localhost:3000/transacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transation),
    });
  } catch (err) {
    console.log(err);
  }
}

//Deleta a transição pelo id com o método DELETE
async function deleteTransicao(id) {
  try {
    const response = await fetch(`http://localhost:3000/transacoes/${id}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.error("Erro na requisição DELETE:", err);
  }
}

//Altera os valores da api utilizando o método PUT
async function editTransicao(transation) {
  try {
    const response = await fetch(
      `http://localhost:3000/transacoes/${transation.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transation),
      },
    );
  } catch (err) {
    console.log(err);
  }
}

// Função que consulta a API com o método GET para atualizar as informações de saldo, despesa e receita no HTML
// esse parâmetro serve apenas para validar caso não tenha nenhuma transação na api, para zerar todos os
// valores, não consegui fazer de alguma forma melhor
async function updateInfo(emptyDiv) {
  // Salva em variável os elementos html
  const saldo = document.getElementById("balance");
  const despesas = document.getElementById("totalExpense");
  const receitas = document.getElementById("totalIncome");
  // Defino o valor inicial como 0
  saldo.value = "0,00";
  receitas.value = "0,00";
  despesas.value = "0,00";
  // função para atualizar o texto de acordo com o novo valor
  function updateHTML() {
    saldo.innerText = `R$ ${saldo.value}`;

    receitas.innerText = `R$ ${receitas.value}`;

    despesas.innerText = `R$ ${despesas.value}`;
  }
  // consulto a API com um método GET para iterar sobre as transações
  try {
    const response = await fetch("http://localhost:3000/transacoes").then(
      (tr) => tr.json(),
    );
    // inicio variáveis para armazenar a soma dos valores de cada transação de acordo com o tipo
    let receitaTotal = 0;
    let despesaTotal = 0;
    let saldoTotal = 0;
    response.forEach((r) => {
      if (r.type === "Receita") {
        receitaTotal += Number(r.amount);
        receitas.value = receitaTotal;
        saldoTotal += Number(r.amount);
        saldo.value = saldoTotal;
      } else if (r.type === "Despesa") {
        despesaTotal += Number(r.amount);
        despesas.value = despesaTotal;
        saldoTotal -= Number(r.amount);
        saldo.value = saldoTotal;
      }
      // atualizo o texto de cada elemento html
      updateHTML();
    });
    // caso não tenha nenhuma transação após deletar alguma, reseta os valores para 0 e atualiza
    if (emptyDiv.style.display === "block") {
      saldo.value = "0,00";
      despesas.value = "0,00";
      receitas.value = "0,00";
      updateHTML();
    }
  } catch (err) {
    console.log(err);
  }
}

// fim da declaração de funções

//Deixa a data padrão do form com a data atual
const today = new Date().toISOString().split("T")[0];
document.getElementById("date").value = today;
//Primeira chamada de funções para carregar a página HTML com as transações já salvas na API
getTransacoes();
updateInfo();

// Salvo o form em variável o form para adicionar um event listener
const form = document.getElementById("transactionForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  //chamo a função ao submeter o form, atualizo o html e reseto os valores da form
  submitTransacao();
  // adiciono um set timeout para dar tempo pro GET não ser feito antes do POST terminar
  setTimeout(() => {
    getTransacoes();
    updateInfo();
    form.reset();
    document.getElementById("date").value = today;
  }, 200);
});

// adiciono um listener de click na ul inteira, tentei adicionar em cada botão ao criar o elemento, mas
// acabava tentando adicionar antes do botão ser de fato criado, então fiz dessa forma
document.querySelector("#transactionsList").addEventListener("click", (e) => {
  // Verifica se o elemento clicado tem a classe 'delete-btn'
  if (e.target.classList.contains("delete-btn")) {
    //pego o id do elemento pai, para poder deletar na API a transação com mesmo ID
    const liPai = e.target.parentElement;
    const id = liPai.id;

    deleteTransicao(id).then(() => {
      liPai.remove(); // Remove do HTML após sucesso na API
      getTransacoes(); // Se não tiver transações, adiciona a mensagem 'nenhuma transação"
      updateInfo(document.getElementById("empty-message")); //chamo a função de atualizar receita e passo
      // esse elemento como parâmetro para validar se está vazia
    });
    //Verifico se o botão clicado foi o de editar
  } else if (e.target.classList.contains("edit-btn")) {
    //Salvo o elemento pai, depois todos os elementos h4 e input para iterar
    const liPai = e.target.parentElement;
    const campos = liPai.querySelectorAll("h4");
    const inputs = liPai.querySelectorAll("input");
    // Variável para saber quando o usuário terminar de editar, caso ele clique quando for um lápis
    // todos os h4 viram inputs, e quando clicar e for um confirmar voltam a ser h4 e salvam na API
    const isEditing = e.target.innerText === "✅";

    if (!isEditing) {
      campos.forEach((h4) => {
        const input = document.createElement("input");
        input.value = h4.innerText;
        // Salva a classe original para não perder o estilo
        input.className = h4.className;
        input.id = h4.id;
        // troco todos os h4 por inputs
        h4.replaceWith(input);
      });
      //altero o texto do botão para quando clicar novamente ter outro comportamento
      e.target.innerText = "✅";
    } else if (isEditing) {
      // crio um novo objeto para salvar na api contendo os valores após a edição
      const transation = {
        id: liPai.id,
        description: document.getElementById(`description${liPai.id}`).value,
        amount: document.getElementById(`amount${liPai.id}`).value,
        type: document.getElementById(`type${liPai.id}`).value,
        category: document.getElementById(`category${liPai.id}`).value,
        date: document.getElementById(`date${liPai.id}`).value,
      };
      // Chamo a função para alterar a transição na API
      editTransicao(transation);
      // Transformo todos os inputs novamente em h4
      inputs.forEach((input) => {
        const h4 = document.createElement("h4");
        h4.innerText = input.value;
        h4.className = input.className;
        h4.id = input.id;
        input.replaceWith(h4);
      });
      e.target.innerText = "🖊️";
      //Intervalo para evitar um bug que não atualizava o html após editar na api
      setTimeout(() => updateInfo(), 100);
    }
  }
});
