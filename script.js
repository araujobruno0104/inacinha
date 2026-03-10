const search = document.getElementById("search");

search.addEventListener("keyup", function(){

let texto = search.value.toLowerCase();

let produtos = document.querySelectorAll(".card");

produtos.forEach(function(produto){

let nome = produto.querySelector("h3").textContent.toLowerCase();

if(nome.includes(texto)){
produto.style.display = "block";
}else{
produto.style.display = "none";
}

});

});