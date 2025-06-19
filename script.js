// 게임 상태 관리
class MathGame {
    constructor() {
        this.currentScreen = 'start';
        this.score = 0;
        this.currentProblem = null;
        this.currentAnswer = null;
        this.timer = null;
        this.timerInterval = null;
        this.timeLeft = 7;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeSounds();
        this.updateAnswerDisplay();
    }
    
    initializeElements() {
        // 화면 요소들
        this.screens = {
            start: document.getElementById('startScreen'),
            game: document.getElementById('gameScreen'),
            success: document.getElementById('successScreen'),
            fail: document.getElementById('failScreen'),
            coupon: document.getElementById('couponScreen')
        };
        
        // 버튼 요소들
        this.buttons = {
            start: document.getElementById('startBtn'),
            submit: document.getElementById('submitBtn'),
            delete: document.getElementById('deleteBtn'),
            retry: document.getElementById('retryBtn'),
            home: document.getElementById('homeBtn'),
            saveCoupon: document.getElementById('saveCouponBtn'),
            homeFromCoupon: document.getElementById('homeFromCouponBtn')
        };
        
        // 숫자 버튼들
        this.numberButtons = document.querySelectorAll('.number-btn[data-number]');
        
        // 게임 요소들
        this.elements = {
            scoreCount: document.getElementById('scoreCount'),
            timerBar: document.getElementById('timerBar'),
            timerText: document.getElementById('timerText'),
            problemText: document.getElementById('problemText'),
            answerDisplay: document.getElementById('answerDisplay'),
            correctAnswer: document.getElementById('correctAnswer'),
            userAnswer: document.getElementById('userAnswer'),
            couponCanvas: document.getElementById('couponCanvas')
        };
        
        // 현재 입력값
        this.currentInput = '';
    }
    
    initializeSounds() {
        this.sounds = {
            success: document.getElementById('successSound'),
            fail: document.getElementById('failSound')
        };
    }
    
    bindEvents() {
        // 시작 버튼
        this.buttons.start.addEventListener('click', () => {
            this.startGame();
        });
        
        // 정답 제출 버튼
        this.buttons.submit.addEventListener('click', () => {
            this.submitAnswer();
        });
        
        // 숫자 버튼들 이벤트
        this.numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                const number = button.getAttribute('data-number');
                this.inputNumber(number);
            });
        });
        
        // 삭제 버튼
        this.buttons.delete.addEventListener('click', () => {
            this.deleteNumber();
        });
        
        // 다시 하기 버튼
        this.buttons.retry.addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        // 홈으로 버튼들
        this.buttons.home.addEventListener('click', () => {
            this.goHome();
        });
        
        this.buttons.homeFromCoupon.addEventListener('click', () => {
            this.goHome();
        });
        
        // 쿠폰 저장 버튼
        this.buttons.saveCoupon.addEventListener('click', () => {
            this.saveCoupon();
        });
    }
    
    // 화면 전환
    switchScreen(screenName) {
        // 모든 화면 비활성화
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 약간의 지연 후 새 화면 활성화 (부드러운 전환을 위해)
        setTimeout(() => {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }, 50);
    }
    
    // 게임 시작
    startGame() {
        console.log('게임 시작!');
        this.resetGame();
        this.generateProblem();
        this.switchScreen('game');
        
        // 화면 전환 후 타이머 시작
        setTimeout(() => {
            this.startTimer();
        }, 100);
    }
    
    // 게임 초기화
    resetGame() {
        this.score = 0;
        this.updateScore();
        this.clearTimer();
        this.currentInput = '';
        this.updateAnswerDisplay();
    }
    
    // 문제 생성 (10~50 사이 랜덤 숫자)
    generateProblem() {
        const num1 = Math.floor(Math.random() * 41) + 10; // 10~50
        const num2 = Math.floor(Math.random() * 41) + 10; // 10~50
        
        this.currentProblem = { num1, num2 };
        this.currentAnswer = num1 + num2;
        
        this.elements.problemText.textContent = `${num1} + ${num2} = ?`;
    }
    
    // 타이머 시작
    startTimer() {
        this.timeLeft = 7;
        this.elements.timerText.textContent = this.timeLeft;
        this.elements.timerBar.classList.add('running');
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.elements.timerText.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.timeOut();
            }
        }, 1000);
    }
    
    // 타이머 정리
    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.elements.timerBar.classList.remove('running');
    }
    
    // 정답 제출
    submitAnswer() {
        if (this.currentInput === '') {
            return;
        }
        
        this.clearTimer();
        const userAnswer = parseInt(this.currentInput);
        
        if (userAnswer === this.currentAnswer) {
            this.correctAnswer();
        } else {
            this.wrongAnswer(userAnswer);
        }
    }
    
    // 정답 처리
    correctAnswer() {
        this.score++;
        this.updateScore();
        this.playSound('success');
        
        this.switchScreen('success');
        
        // 1.5초 후 다음 문제 또는 쿠폰 화면
        setTimeout(() => {
            if (this.score >= 3) {
                this.showCoupon();
            } else {
                this.generateProblem();
                this.switchScreen('game');
                this.startTimer();
                this.currentInput = '';
                this.updateAnswerDisplay();
            }
        }, 1500);
    }
    
    // 오답 처리
    wrongAnswer(userAnswer) {
        this.playSound('fail');
        this.elements.correctAnswer.textContent = `정답: ${this.currentAnswer}`;
        this.elements.userAnswer.textContent = `입력한 값: ${userAnswer}`;
        this.switchScreen('fail');
        this.triggerFailAnimation();
    }
    
    // 시간 초과 처리
    timeOut() {
        this.clearTimer();
        this.playSound('fail');
        this.elements.correctAnswer.textContent = `정답: ${this.currentAnswer}`;
        this.elements.userAnswer.textContent = `입력한 값: 미입력`;
        this.switchScreen('fail');
        this.triggerFailAnimation();
    }
    
    // 실패 애니메이션 트리거
    triggerFailAnimation() {
        const leftImage = document.querySelector('.flying-image.left');
        const rightImage = document.querySelector('.flying-image.right');
        
        // 애니메이션 재시작을 위해 클래스 제거 후 추가
        leftImage.style.animation = 'none';
        rightImage.style.animation = 'none';
        
        setTimeout(() => {
            leftImage.style.animation = 'flyLeft 2s ease-out';
            rightImage.style.animation = 'flyRight 2s ease-out';
        }, 10);
    }
    
    // 쿠폰 화면 표시
    showCoupon() {
        this.switchScreen('coupon');
        this.drawCoupon();
        this.triggerCelebration();
    }
    
    // 쿠폰 그리기
    drawCoupon() {
        const canvas = this.elements.couponCanvas;
        const ctx = canvas.getContext('2d');
        
        // 배경
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 테두리
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        // 텍스트
        ctx.fillStyle = '#28a745';
        ctx.font = 'bold 24px "Noto Sans KR"';
        ctx.textAlign = 'center';
        ctx.fillText('🥤 음료수 무료 쿠폰', canvas.width / 2, 50);
        
        ctx.font = '16px "Noto Sans KR"';
        ctx.fillText('더하기 게임 3연승 달성!', canvas.width / 2, 80);
        
        ctx.font = '14px "Noto Sans KR"';
        ctx.fillText('축하합니다! 🎉', canvas.width / 2, 110);
        
        // 날짜
        const today = new Date();
        const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
        ctx.fillText(`발급일: ${dateStr}`, canvas.width / 2, 140);
        
        ctx.font = '12px "Noto Sans KR"';
        ctx.fillText('유효기간: 발급일로부터 30일', canvas.width / 2, 170);
    }
    
    // 축하 애니메이션 트리거
    triggerCelebration() {
        const confetti = document.querySelector('.confetti-animation');
        confetti.style.animation = 'none';
        setTimeout(() => {
            confetti.style.animation = 'confettiFall 3s linear infinite';
        }, 10);
    }
    
    // 쿠폰 저장
    saveCoupon() {
        const canvas = this.elements.couponCanvas;
        const link = document.createElement('a');
        link.download = `음료수쿠폰_${new Date().getTime()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }
    
    // 홈으로 이동
    goHome() {
        this.resetGame();
        this.switchScreen('start');
    }
    
    // 점수 업데이트
    updateScore() {
        this.elements.scoreCount.textContent = this.score;
    }
    
    // 숫자 입력
    inputNumber(num) {
        if (this.currentInput.length < 3) { // 최대 3자리까지 입력 가능
            this.currentInput += num;
            this.updateAnswerDisplay();
        }
    }
    
    // 숫자 삭제
    deleteNumber() {
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateAnswerDisplay();
    }
    
    // 답안 표시 업데이트
    updateAnswerDisplay() {
        if (this.currentInput === '') {
            this.elements.answerDisplay.textContent = '정답 입력';
            this.elements.answerDisplay.classList.add('placeholder');
        } else {
            this.elements.answerDisplay.textContent = this.currentInput;
            this.elements.answerDisplay.classList.remove('placeholder');
        }
    }
    
    // 사운드 재생
    playSound(type) {
        try {
            if (this.sounds[type]) {
                this.sounds[type].currentTime = 0;
                this.sounds[type].play().catch(e => {
                    console.log('사운드 재생 실패:', e);
                });
            }
        } catch (error) {
            console.log('사운드 재생 오류:', error);
        }
    }
}

// 페이지 로드 시 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    const game = new MathGame();
    
    // 터치 이벤트 최적화 (모바일)
    document.addEventListener('touchstart', () => {}, { passive: true });
    
    // 화면 방향 변경 처리
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 500);
    });
    
    // 뒤로가기 방지 (게임 중)
    window.addEventListener('beforeunload', (e) => {
        if (game.currentScreen === 'game') {
            e.preventDefault();
            e.returnValue = '';
        }
    });
    
    // 개발자 도구용 전역 변수 (디버깅용)
    window.game = game;
}); 