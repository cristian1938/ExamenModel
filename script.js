// Función para leer el archivo .txt y cargar las preguntas
async function loadQuestionsFromFile() {
    const response = await fetch('preguntas.txt');
    const text = await response.text();
    return parseQuestions(text);
}

// Función para parsear el contenido del archivo .txt
function parseQuestions(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const questions = [];
    let currentQuestion = {};

    lines.forEach(line => {
        if (line.startsWith('Answer:')) {
            currentQuestion.answer = line.split(' ')[1].trim().charCodeAt(0) - 65;
            questions.push(currentQuestion);
            currentQuestion = {};
        } else if (line.match(/^[A-Z]\./)) {
            const optionText = line.slice(3).trim();
            currentQuestion.options.push(optionText);
        } else {
            currentQuestion.question = line.split('.').slice(1).join('.').trim();
            currentQuestion.options = [];
        }
    });

    return questions;
}

// Función para mezclar aleatoriamente un arreglo
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Variables del DOM
const questionContainer = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const resultContainer = document.getElementById("result");
const questionCountContainer = document.getElementById("question-count");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const toggleViewButton = document.getElementById("toggle-view-button");
const quantityInput = document.getElementById("quantity-input");
const loadQuestionsButton = document.getElementById("load-questions-button");

let currentQuestion = 0;
let score = 0;
let selectedAnswers = [];
let questions = [];
let incorrectQuestions = [];
let reviewingIncorrect = false;
let isGridView = false;

// Función para cargar una pregunta
function loadQuestion() {
    const current = questions[currentQuestion];
    questionContainer.innerText = current.question;
    optionsContainer.innerHTML = "";
    questionCountContainer.innerText = `Question ${currentQuestion + 1} of ${questions.length}`;

    const shuffledOptions = shuffleArray([...current.options]);
    shuffledOptions.forEach((option, index) => {
        const optionElement = document.createElement("div");
        optionElement.classList.add("option");
        optionElement.dataset.value = current.options.indexOf(option);

        if (isGridView) {
            optionElement.innerText = option;
            optionElement.addEventListener("click", selectOption);
        } else {
            const input = document.createElement("input");
            input.type = "radio";
            input.name = "option";
            input.value = index;
            input.addEventListener("change", selectOption);
            optionElement.appendChild(input);

            const label = document.createElement("label");
            label.innerText = option;
            optionElement.appendChild(label);
        }

        optionsContainer.appendChild(optionElement);
    });

    if (selectedAnswers[currentQuestion] !== null) {
        const selectedOption = optionsContainer.querySelector(`[data-value="${selectedAnswers[currentQuestion]}"]`);
        if (selectedOption) {
            selectedOption.classList.add("selected");
            if (!isGridView) {
                selectedOption.querySelector('input').checked = true;
            }
        }
    }

    prevButton.disabled = currentQuestion === 0;
    nextButton.disabled = selectedAnswers[currentQuestion] === null;
}

// Función para seleccionar una opción
function selectOption(event) {
    const selectedOption = isGridView ? event.currentTarget : event.currentTarget.parentElement;
    const answer = parseInt(selectedOption.dataset.value);

    if (selectedAnswers[currentQuestion] === null) {
        if (answer === questions[currentQuestion].answer) {
            score++;
            selectedOption.classList.add("correct");
            if (reviewingIncorrect) {
                incorrectQuestions = incorrectQuestions.filter(q => q !== questions[currentQuestion]);
            }
        } else {
            selectedOption.classList.add("incorrect");
            optionsContainer.querySelector(`[data-value="${questions[currentQuestion].answer}"]`).classList.add("correct");
            if (!reviewingIncorrect) {
                incorrectQuestions.push(questions[currentQuestion]);
            }
        }
        selectedAnswers[currentQuestion] = answer;
        nextButton.disabled = false;
    }
}

// Función para mostrar el resultado final
function showResult() {
    resultContainer.innerText = `Your score: ${score}/${questions.length}`;
    if (incorrectQuestions.length > 0) {
        setTimeout(() => {
            questions = incorrectQuestions;
            currentQuestion = 0;
            selectedAnswers = Array(questions.length).fill(null);
            reviewingIncorrect = true;
            loadQuestion();
            resultContainer.innerText += "\nReview your incorrect answers:";
        }, 3000);
    } else {
        resultContainer.innerText += "\nYou've answered all questions correctly.";
    }
}

// Manejar
// Manejar el botón anterior
prevButton.addEventListener("click", function() {
    currentQuestion--;
    loadQuestion();
});

// Manejar el botón siguiente
nextButton.addEventListener("click", function() {
    if (selectedAnswers[currentQuestion] !== null) {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            loadQuestion();
        } else {
            showResult();
        }
    } else {
        alert("Please select an option before proceeding.");
    }
});

// Manejar el botón de alternancia de vista
toggleViewButton.addEventListener("click", function() {
    isGridView = !isGridView;
    optionsContainer.classList.toggle('grid', isGridView);
    document.body.classList.toggle('list-view', !isGridView);
    loadQuestion();
});

// Manejar el botón de carga de preguntas
loadQuestionsButton.addEventListener("click", function() {
    const quantity = parseInt(quantityInput.value);
    if (!isNaN(quantity) && quantity > 0 && quantity <= 1000) {
        loadQuestions(quantity);
    } else {
        alert("Please enter a valid quantity between 1 and 300.");
    }
});

// Función para cargar la cantidad especificada de preguntas
async function loadQuestions(quantity) {
    const allQuestions = await loadQuestionsFromFile();
    questions = shuffleArray(allQuestions).slice(0, quantity);
    selectedAnswers = Array(questions.length).fill(null);
    currentQuestion = 0;
    loadQuestion();
}

// Cargar preguntas iniciales
loadQuestions(1000); // Cargar inicialmente 10 preguntas
