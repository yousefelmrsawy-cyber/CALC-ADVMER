const keysD = document.querySelector(".keys");
const screenDisplay = document.querySelector(".screen p");

const keysArr = [
    '7', '8', '9', 'del',
    '4', '5', '6', '+',
    '1', '2', '3', '-',
    '.', '0', '/', '*',
    'π', 'RESET', 'Equal'
];
// Render all buttons in a clean single step
keysD.innerHTML = keysArr.map(key => `<button class="${key}">${key}</button>`).join('');
screenDisplay.textContent = '0';
function calculate() {
    let expr = screenDisplay.innerText.trim();
    while (expr.length > 0 && ['+', '-', '*', '/'].includes(expr.slice(-1))) {
        expr = expr.slice(0, -1);
    }
    if (!expr) return 0;

    const parseNum = (val) => {
        val = val.trim();
        if (val === 'π') return Math.PI;
        return Number(val);
    };

    const resArr = [];
    let j = 0;
    for (let i = 0; i < expr.length; i = j + 1) {
        for (j = i; j <= expr.length; j++) {
            if (['+', '/', '*', '-'].includes(expr[j])) {
                resArr.push(parseNum(expr.slice(i, j)));
                resArr.push(expr[j]);
                break;
            } else if (j === expr.length) {
                const lastPart = expr.slice(i, j).trim();
                if (lastPart) {
                    resArr.push(parseNum(lastPart));
                }
            }
        }
    }
    if (resArr.length === 0) return 0;
    const afterMulDiv = [];
    for (let k = 0; k < resArr.length; k++) {
        const item = resArr[k];

        if (item === '*' || item === '/') {
            const prev = afterMulDiv.pop();
            const next = resArr[++k]; 

            if (item === '*') {
                afterMulDiv.push(prev * next);
            } else {
                afterMulDiv.push(prev / next);
            }
        } else {
            afterMulDiv.push(item);
        }
    }

    let result = afterMulDiv[0];
    for (let k = 1; k < afterMulDiv.length; k += 2) {
        const op = afterMulDiv[k];
        const next = afterMulDiv[k + 1];

        if (op === '+') {
            result += next;
        } else if (op === '-') {
            result -= next;
        }
    }

    return result;
}

let isNewCalculation = false;

const buttons = keysD.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const key = button.textContent.trim();

        if (key === 'RESET') {
            screenDisplay.innerText = '0';
            isNewCalculation = false;
            return;
        }

        if (key === 'del') {
            if (isNewCalculation || screenDisplay.innerText === 'Error' || screenDisplay.innerText.length <= 1) {
                screenDisplay.innerText = '0';
            } else {
                screenDisplay.innerText = screenDisplay.innerText.slice(0, -1);
            }
            isNewCalculation = false;
            return;
        }

        if (key === 'Equal') {
            const result = calculate();
            if (isNaN(result) || !isFinite(result)) {
                screenDisplay.innerText = 'Error';
            } else {
                // Round to avoid floating point precision quirks (e.g. 0.1 + 0.2)
                const rounded = Number.isInteger(result) ? result : Number(result.toFixed(10));
                screenDisplay.innerText = rounded.toString();
            }
            isNewCalculation = true;
            return;
        }

        if (['+', '-', '*', '/'].includes(key)) {
            if (screenDisplay.innerText === 'Error') {
                screenDisplay.innerText = '0';
            }

            if (screenDisplay.innerText === '0' && key === '-') {
                screenDisplay.innerText = '-';
                isNewCalculation = false;
                return;
            }

            const lastChar = screenDisplay.innerText.slice(-1);
            if (['+', '-', '*', '/'].includes(lastChar)) {
                screenDisplay.innerText = screenDisplay.innerText.slice(0, -1) + key;
            } else {
                screenDisplay.innerText += key;
            }
            isNewCalculation = false;
            return;
        }

        if (key === '.') {
            if (isNewCalculation || screenDisplay.innerText === 'Error') {
                screenDisplay.innerText = '0.';
                isNewCalculation = false;
                return;
            }

            const segments = screenDisplay.innerText.split(/[+\-*/]/);
            const currentSegment = segments[segments.length - 1];
            if (currentSegment.includes('.')) {
                return;
            }

            if (['+', '-', '*', '/'].includes(screenDisplay.innerText.slice(-1))) {
                screenDisplay.innerText += '0.';
            } else {
                screenDisplay.innerText += '.';
            }
            isNewCalculation = false;
            return;
        }

        if (key === 'π') {
            if (screenDisplay.innerText === '0' || isNewCalculation || screenDisplay.innerText === 'Error') {
                screenDisplay.innerText = 'π';
            } else {
                const lastChar = screenDisplay.innerText.slice(-1);
                if (['+', '-', '*', '/'].includes(lastChar)) {
                    screenDisplay.innerText += 'π';
                } else {
                    screenDisplay.innerText += '*π';
                }
            }
            isNewCalculation = false;
            return;
        }

        // Numbers (0 - 9)
        if (screenDisplay.innerText === '0' || isNewCalculation || screenDisplay.innerText === 'Error') {
            screenDisplay.innerText = key;
        } else {
            screenDisplay.innerText += key;
        }
        isNewCalculation = false;
    });
});

window.addEventListener('keydown', (e) => {
    let key = e.key;
    if (key === 'Enter') key = 'Equal';
    if (key === 'Escape') key = 'RESET';
    if (key === 'Backspace') key = 'del';
    if (key.toLowerCase() === 'p') key = 'π';

    const targetButton = Array.from(buttons).find(btn => btn.textContent.trim() === key);
    if (targetButton) {
        targetButton.click();
        targetButton.classList.add('active-key');
        setTimeout(() => targetButton.classList.remove('active-key'), 150);
    }
});

// Theme Toggle (Light / Dark Mode)
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        if (themeToggle) themeToggle.checked = true;
        localStorage.setItem('calculator-theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        if (themeToggle) themeToggle.checked = false;
        localStorage.setItem('calculator-theme', 'light');
    }
}

// Restore saved preference on load
const savedTheme = localStorage.getItem('calculator-theme');
if (savedTheme === 'dark') {
    applyTheme(true);
} else if (savedTheme === 'light') {
    applyTheme(false);
}

if (themeToggle) {
    themeToggle.addEventListener('change', () => {
        applyTheme(themeToggle.checked);
    });
}