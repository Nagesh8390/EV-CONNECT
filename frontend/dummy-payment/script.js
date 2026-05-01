// State Management
const views = {
    payment: document.getElementById('view-payment'),
    processing: document.getElementById('view-processing'),
    otp: document.getElementById('view-otp'),
    success: document.getElementById('view-success')
};

// UI Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const payBtn = document.getElementById('payBtn');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const otpFields = document.querySelectorAll('.otp-field');
const cardNumberInput = document.getElementById('cardNumber');
const expiryDateInput = document.getElementById('expiryDate');
const cvvInput = document.getElementById('cvv');
const cardIcon = document.getElementById('cardIcon');
const bankPills = document.querySelectorAll('.bank-pill');
const bankSelect = document.getElementById('bankSelect');

// Receipt Elements
const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
const receiptModal = document.getElementById('receiptModal');
const closeModalBtn = document.getElementById('closeModalBtn');
let transactionData = {};

// Optional Sound Effects using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if(audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'click') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
}

// Add click sound to all buttons
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        // Only play if not heavily interacting to avoid spam
        try { playSound('click'); } catch(e) { console.log("Audio play blocked"); }
    });
});

// View Navigation
function switchView(viewName) {
    Object.values(views).forEach(v => {
        if(v.classList.contains('active')) {
            v.classList.remove('show');
            setTimeout(() => {
                v.classList.remove('active');
            }, 300);
        }
    });

    setTimeout(() => {
        const nextView = views[viewName];
        nextView.classList.add('active');
        // Let browser register display block before fading in
        setTimeout(() => {
            nextView.classList.add('show');
        }, 50);
    }, 300);
}

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

        const targetId = e.target.getAttribute('data-target');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if(content.id === targetId) {
                content.classList.add('active');
            }
        });
    });
});

// Bank Pills interaction
bankPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
        const bankName = e.target.innerText.toLowerCase();
        let optionToSelect;
        
        switch(bankName) {
            case 'sbi': optionToSelect = 'sbi'; break;
            case 'hdfc': optionToSelect = 'hdfc'; break;
            case 'icici': optionToSelect = 'icici'; break;
            case 'axis': optionToSelect = 'axis'; break;
        }

        if(optionToSelect) {
            bankSelect.value = optionToSelect;
        }
    });
});

// Card Number Formatting and Validation
cardNumberInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Auto detect card type (dummy logic)
    if(value.startsWith('4')) {
        cardIcon.innerText = '🔵'; // Visa approximation
    } else if(value.startsWith('5')) {
        cardIcon.innerText = '🔴'; // Mastercard approximation
    } else {
        cardIcon.innerText = '💳';
    }

    // Add spaces every 4 digits
    let formattedValue = '';
    for(let i = 0; i < value.length; i++) {
        if(i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
    
    // Simple validation feedback
    if(value.length === 16) {
        e.target.style.borderColor = 'var(--success)';
    } else {
        e.target.style.borderColor = 'var(--border)';
    }
});

// Expiry Date Formatting
expiryDateInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if(value.length >= 2) {
        // Validate month
        let month = parseInt(value.substring(0, 2));
        if(month > 12) value = '12' + value.substring(2);
        if(month === 0) value = '01' + value.substring(2);
        
        // Add slash
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    e.target.value = value;
});

// CVV Masking behavior is handled by type="password"
cvvInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Payment Flow
payBtn.addEventListener('click', () => {
    const activeTab = document.querySelector('.tab-btn.active').innerText;
    
    // Small validation (mock)
    if(activeTab === 'Card' && cardNumberInput.value.replace(/\s/g, '').length < 16) {
        document.getElementById('cardNumberError').innerText = 'Please enter a valid 16-digit card number';
        setTimeout(() => document.getElementById('cardNumberError').innerText = '', 3000);
        return;
    }

    payBtn.disabled = true;
    payBtn.innerHTML = 'Securely Connecting...';

    // Start Flow
    setTimeout(() => {
        switchView('processing');
        
        // Mock processing delay to OTP
        setTimeout(() => {
            switchView('otp');
            setTimeout(() => {
                if(otpFields[0]) otpFields[0].focus();
            }, 500); // Focus first OTP field after animation
        }, 2500);

    }, 500);
});

// OTP Input Handling
otpFields.forEach((field, index) => {
    field.addEventListener('input', (e) => {
        // Allow only numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');

        if(e.target.value && index < otpFields.length - 1) {
            otpFields[index + 1].focus();
        }
        
        // Auto submit if all filled
        let allFilled = true;
        otpFields.forEach(f => {
            if(!f.value) allFilled = false;
        });

        if(allFilled) {
            verifyOtpBtn.classList.add('ready');
            // Auto click verify for smoother flow
            setTimeout(() => {
                if(window.getComputedStyle(views.otp).opacity === '1') {
                    verifyOtpBtn.click();
                }
            }, 600);
        }
    });

    field.addEventListener('keydown', (e) => {
        if(e.key === 'Backspace' && !e.target.value && index > 0) {
            otpFields[index - 1].focus();
        }
    });
});

verifyOtpBtn.addEventListener('click', () => {
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px; display: inline-block; margin-bottom: 0px; vertical-align: middle; margin-right: 8px;"></span> Verifying...';

    // Setup Success Data
    const activeTabStr = document.querySelector('.tab-btn.active').innerText;
    
    // Generate Random Txn ID
    const randomNums = Math.floor(10000000 + Math.random() * 90000000); // 8 digit
    const txnId = `TXN${randomNums}`;
    
    // Current Formatted Date
    const now = new Date();
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateString = now.toLocaleDateString('en-IN', dateOptions);

    transactionData = {
        txnId: txnId,
        date: dateString,
        method: activeTabStr,
        amount: '₹ 500.00'
    };

    // Show Success screen after simulated verification delay
    setTimeout(() => {
        document.getElementById('summaryTxnId').innerText = transactionData.txnId;
        document.getElementById('summaryDate').innerText = transactionData.date;
        document.getElementById('summaryMethod').innerText = transactionData.method;
        
        // Also populate modal details early
        document.getElementById('receiptTxn').innerText = transactionData.txnId;
        document.getElementById('receiptDate').innerText = transactionData.date;

        switchView('success');
        
        setTimeout(() => {
            try { playSound('success'); } catch(e) { }
        }, 400); // play success sound when animation starts

    }, 2000);
});

// Navigation from Success Screen
document.getElementById('goBackBtn').addEventListener('click', () => {
    // Reset Flow
    window.location.reload();
});

// Modal Logic
downloadReceiptBtn.addEventListener('click', () => {
    receiptModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    receiptModal.classList.remove('active');
});

// Close modal when clicking outside
receiptModal.addEventListener('click', (e) => {
    if(e.target === receiptModal) {
        receiptModal.classList.remove('active');
    }
});
