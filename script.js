document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('shadow-sm');
            } else {
                navbar.classList.remove('shadow-sm');
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    const semesterSelect = document.getElementById('semesterSelect');
    const babSelect = document.getElementById('babSelect');
    const initialState = document.getElementById('initialState');
    const studyContent = document.getElementById('studyContent');
    const materiTitle = document.getElementById('materiTitle');
    const materiText = document.getElementById('materiText');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const quizSection = document.getElementById('quizSection');
    const quizContainer = document.getElementById('quizContainer');
    const quizTitle = document.getElementById('quizTitle');
    const closeQuizBtn = document.getElementById('closeQuizBtn');
    const submitQuizBtn = document.getElementById('submitQuizBtn');
    const quizResult = document.getElementById('quizResult');
    const scoreValue = document.getElementById('scoreValue');
    const retryQuizBtn = document.getElementById('retryQuizBtn');
    const backToMateriBtn = document.getElementById('backToMateriBtn');
    const mainContentRow = document.getElementById('mainContentRow');

    let quizData = null;
    let currentBabData = null;

    if (semesterSelect && babSelect) {
        const subject = document.body.getAttribute('data-subject');

        if (subject) {
            fetch('../quiz.json?v=' + new Date().getTime())
                .then(response => response.json())
                .then(data => {
                    if (data[subject]) {
                        quizData = data[subject];
                    } else {
                        console.error('data tidak ditemukan:', subject);
                    }
                })
                .catch(error => console.error('Error data quiz:', error));
        } else {
            console.error('tidak ada.');
        }

        semesterSelect.addEventListener('change', function () {
            const semester = this.value;

            babSelect.innerHTML = '<option selected disabled>Pilih Bab</option>';
            babSelect.disabled = false;


            studyContent.classList.add('d-none');
            initialState.classList.remove('d-none');
            currentBabData = null;

            if (quizData && quizData[semester]) {
                Object.keys(quizData[semester]).forEach(babKey => {
                    const bab = quizData[semester][babKey];
                    const option = document.createElement('option');
                    option.value = babKey;
                    option.textContent = bab.title;
                    babSelect.appendChild(option);
                });
            }
        });

        babSelect.addEventListener('change', function () {
            const semester = semesterSelect.value;
            const babKey = this.value;


            if (quizData && quizData[semester] && quizData[semester][babKey]) {
                currentBabData = quizData[semester][babKey];


                initialState.classList.add('d-none');
                studyContent.classList.remove('d-none');

                materiTitle.textContent = currentBabData.title;
                materiText.innerHTML = currentBabData.summary;

                const materiImage = document.getElementById('materiImage');
                if (materiImage) {
                    if (currentBabData.image) {

                        materiImage.src = currentBabData.image;
                        materiImage.classList.remove('d-none');
                    } else {

                        materiImage.classList.add('d-none');
                    }
                }
            }
        });

        startQuizBtn.addEventListener('click', function () {
            if (currentBabData && currentBabData.questions) {
                if (mainContentRow) mainContentRow.classList.add('d-none');

                studyContent.classList.add('d-none');
                quizSection.classList.remove('d-none');
                quizTitle.textContent = currentBabData.title;
                renderQuiz(currentBabData.questions);

                window.scrollTo(0, 0);
            }
        });

        function renderQuiz(questions) {

            quizContainer.innerHTML = '';
            questions.forEach((q, index) => {

                const questionEl = document.createElement('div');
                questionEl.classList.add('mb-4');
                questionEl.innerHTML = `
                    ${q.image ? `<img src="${q.image}" class="question-img mb-3" alt="Question Image" style="max-width: 100%; height: auto;">` : ''}
                    <h5 class="mb-3">${index + 1}. ${q.question}</h5>
                    <div class="list-group">
                        ${q.options.map((opt, i) => `
                            <label class="list-group-item list-group-item-action">
                                <input class="form-check-input me-1" type="radio" name="question${q.id}" value="${opt}">
                                ${opt}
                            </label>
                        `).join('')}
                    </div>
                `;
                quizContainer.appendChild(questionEl);
            });
        }

        closeQuizBtn.addEventListener('click', function () {
            quizSection.classList.add('d-none');
            studyContent.classList.remove('d-none');

            if (mainContentRow) mainContentRow.classList.remove('d-none');
        });

        submitQuizBtn.addEventListener('click', function () {
            let score = 0;
            let totalQuestions = currentBabData.questions.length;

            currentBabData.questions.forEach(q => {
                const selectedOption = document.querySelector(`input[name="question${q.id}"]:checked`);
                if (selectedOption && selectedOption.value === q.answer) {
                    score++;
                }
            });

            const finalScore = Math.round((score / totalQuestions) * 100);

            quizSection.classList.add('d-none');
            quizResult.classList.remove('d-none');
            scoreValue.textContent = finalScore;

            window.scrollTo(0, 0);
        });

        retryQuizBtn.addEventListener('click', function () {
            quizResult.classList.add('d-none');
            quizSection.classList.remove('d-none');
            document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);

            window.scrollTo(0, 0);
        });

        backToMateriBtn.addEventListener('click', function () {
            quizResult.classList.add('d-none');
            studyContent.classList.remove('d-none');

            if (mainContentRow) mainContentRow.classList.remove('d-none');
        });
    }
});
