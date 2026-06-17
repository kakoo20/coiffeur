let bookingState = { service: null, price: 0, date: null, time: null, name: '', phone: '', email: '' };
let currentStep = 1;
let currentDate = new Date(); 
let selectedDate = null;
let selectedTime = null;
let bookedSlots = [];

// Insert your newly generated Google Web App URL here:
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw08J2knSWPhAGje8L9TLe_UNpVKhURmpvKyYTnRjmXybJnRnC4uPmgmeH-xA7y9yBAtA/exec";

// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    }
});

// UI Animation Reveal Engine
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('animate-in');
    observer.observe(el);
});

setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
}, 1200);

// Navigation Elements
function toggleMobileMenu() {
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('menuBtn');
    if (nav) nav.classList.toggle('active');
    if (btn) btn.classList.toggle('active');
}

function closeMobileMenu() {
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('menuBtn');
    if (nav) nav.classList.remove('active');
    if (btn) btn.classList.remove('active');
}

// Form Stepper Wizard Logic
function goToStep(step) {
    if (step === 2 && !bookingState.service) return;
    if (step === 3 && (!selectedDate || !selectedTime)) return;
    
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    const targetStep = document.getElementById('step' + step);
    if (targetStep) targetStep.classList.add('active');
    
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById('step' + i + 'Indicator');
        if (indicator) {
            indicator.classList.remove('active', 'completed');
            if (i < step) indicator.classList.add('completed');
            else if (i === step) indicator.classList.add('active');
        }
    }
    currentStep = step;
    if (step === 3) updateSummary();
}

function selectService(element) {
    document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    bookingState.service = element.dataset.service;
    bookingState.price = parseInt(element.dataset.price) || 0;
    
    const nextBtn = document.getElementById('step1Next');
    if (nextBtn) nextBtn.disabled = false;
}

function selectServiceFromCard(name, price) {
    const options = document.querySelectorAll('.service-option');
    options.forEach(opt => { 
        if (opt.dataset.service === name) selectService(opt);
    });
    const bookingSection = document.getElementById('booking');
    if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { goToStep(2); }, 400);
}

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Fetch Availability via GET Route
async function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    selectedDate.setHours(0, 0, 0, 0);
    selectedTime = null; 
    
    const nextBtn = document.getElementById('step2Next');
    if (nextBtn) nextBtn.disabled = true;
    
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const timeGrid = document.getElementById('timeGrid');
    if (timeGrid) {
        timeGrid.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1; text-align: center; padding: 20px;"><span class="spinner"></span> Reading real-time availability...</div>';
    }
    
    const container = document.getElementById('timeSlotsContainer');
    if (container) container.style.display = 'block';

    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getBusyTimes&date=${formattedDate}`);
        const data = await response.json();
        bookedSlots = data.busyTimes || [];
    } catch (error) {
        console.error("Calendar link failure:", error);
        bookedSlots = []; 
    }

    renderCalendar();
    renderTimeSlots(); 
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const currentMonthEl = document.getElementById('currentMonth');
    if (currentMonthEl) currentMonthEl.textContent = monthNames[month] + ' ' + year;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); 
    
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    const prevMonthBtn = document.getElementById('prevMonth');
    if (prevMonthBtn) prevMonthBtn.disabled = isCurrentMonth;
    
    let html = '';
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day disabled"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;
        const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
        const isSunday = date.getDay() === 0;
        
        let classes = 'calendar-day';
        if (isPast || isSunday) classes += ' disabled';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';
        
        if (isPast || isSunday) {
            html += `<div class="${classes}">${day}</div>`;
        } else {
            html += `<div class="${classes}" onclick="selectDate(${year}, ${month}, ${day})">${day}</div>`;
        }
    }
    calendarGrid.innerHTML = html;
}

function changeMonth(delta) {
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function renderTimeSlots() {
    const timeGrid = document.getElementById('timeGrid');
    if (!timeGrid) return;

    const slots = ['10:00','10:50','11:40','12:30','13:30','14:20','15:10','16:00','16:50','17:40','18:30','19:20','20:10','21:00','21:50','22:40'];
    const day = selectedDate ? selectedDate.getDay() : -1;
    let html = '';
    
    slots.forEach((time) => {
        const isBreakTime = time === '12:30' || time === '20:10';
        const isFridayClosed = day === 5 && time < '14:00'; 
        const isGoogleBooked = bookedSlots.includes(time);
        
        const isDisabled = isBreakTime || isFridayClosed || isGoogleBooked;
        const isSelected = selectedTime === time;
        
        let classes = 'time-slot';
        if (isDisabled) classes += ' disabled';
        if (isSelected) classes += ' selected';
        
        if (isDisabled) {
            html += `<div class="${classes}">${time}</div>`;
        } else {
            html += `<div class="${classes}" onclick="selectTime(this, '${time}')">${time}</div>`;
        }
    });
    timeGrid.innerHTML = html;
}

function selectTime(element, time) {
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    selectedTime = time;
    const nextBtn = document.getElementById('step2Next');
    if (nextBtn) nextBtn.disabled = false;
}

function updateSummary() {
    const sService = document.getElementById('summaryService');
    const sDate = document.getElementById('summaryDate');
    const sTime = document.getElementById('summaryTime');
    const sPrice = document.getElementById('summaryPrice');

    if (sService) sService.textContent = bookingState.service || '-';
    if (sDate) sDate.textContent = selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '-';
    if (sTime) sTime.textContent = selectedTime || '-';
    if (sPrice) sPrice.textContent = bookingState.price ? bookingState.price.toLocaleString() + ' DZD' : '-';
}

function validateForm() {
    const nameEl = document.getElementById('clientName');
    const phoneEl = document.getElementById('clientPhone');
    const emailEl = document.getElementById('clientEmail');
    const confirmBtn = document.getElementById('confirmBtn');
    
    // Grab the red text error message elements
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const emailError = document.getElementById('emailError');
    
    if (!nameEl || !phoneEl || !confirmBtn) return;

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const email = emailEl ? emailEl.value.trim() : '';
    
    // 1. Logic Validation Rules
    const isNameValid = name.length > 2;
    const isPhoneValid = phone.length > 8;
    const isEmailValid = email === '' || (email.includes('@') && email.includes('.'));
    
    // 2. Red Inline Warnings UI Control
    
    // Name field error: Show only if they started typing but it's too short
    if (name.length > 0 && !isNameValid) {
        if (nameError) nameError.style.display = 'block';
        nameEl.style.borderColor = '#ff4d4d'; // Red border
    } else {
        if (nameError) nameError.style.display = 'none';
        nameEl.style.borderColor = ''; // Default border
    }

    // Phone field error: Show if they typed something but it's under 9 digits (like a 5-digit number)
    if (phone.length > 0 && !isPhoneValid) {
        if (phoneError) phoneError.style.display = 'block';
        phoneEl.style.borderColor = '#ff4d4d';
    } else {
        if (phoneError) phoneError.style.display = 'none';
        phoneEl.style.borderColor = '';
    }

    // Email field error: Since it's optional, only check if it's NOT empty
    if (email.length > 0 && !isEmailValid) {
        if (emailError) emailError.style.display = 'block';
        if (emailEl) emailEl.style.borderColor = '#ff4d4d';
    } else {
        if (emailError) emailError.style.display = 'none';
        if (emailEl) emailEl.style.borderColor = '';
    }
    
    // 3. Master Button State Switch
    const isValid = isNameValid && isPhoneValid && isEmailValid;
    confirmBtn.disabled = !isValid;
    
    // Optional styling to make the button look disabled or active
    if (isValid) {
        confirmBtn.style.opacity = '1';
        confirmBtn.style.cursor = 'pointer';
    } else {
        confirmBtn.style.opacity = '0.5';
        confirmBtn.style.cursor = 'not-allowed';
    }
}

// Booking submission via clean, redirect-safe GET parameterization
async function submitBooking() {
    const btn = document.getElementById('confirmBtn');
    if (!btn) return;
    btn.innerHTML = '<span class="spinner"></span> Creating Appointment...';
    btn.disabled = true;
    
    bookingState.name = document.getElementById('clientName').value.trim();
    bookingState.phone = document.getElementById('clientPhone').value.trim();
    bookingState.email = document.getElementById('clientEmail') ? document.getElementById('clientEmail').value.trim() : '';
    const notes = document.getElementById('clientNotes') ? document.getElementById('clientNotes').value.trim() : '';
    
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const bookingPayload = {
        date: formattedDate,
        time: selectedTime,
        service: bookingState.service,
        price: bookingState.price,
        name: bookingState.name,
        phone: bookingState.phone,
        email: bookingState.email,
        notes: notes
    };
    
    try {
        const encodedData = encodeURIComponent(JSON.stringify(bookingPayload));
        // We use standard fetch here so that Apps Script returns authentic processing statuses!
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=book&data=${encodedData}`);
        const result = await response.json();
        
        if (result.success) {
            const successScreen = document.getElementById('bookingSuccess');
            const step3Screen = document.getElementById('step3');
            const progressWizard = document.querySelector('.booking-progress');
            
            if (successScreen) successScreen.classList.add('active');
            if (step3Screen) step3Screen.classList.remove('active');
            if (progressWizard) progressWizard.style.display = 'none';
            
            document.getElementById('successService').textContent = bookingState.service;
            document.getElementById('successDate').textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            document.getElementById('successTime').textContent = selectedTime;
            document.getElementById('successName').textContent = bookingState.name;
        } else {
            alert('Booking engine notice: ' + (result.error || 'Please choose a different slot.'));
            btn.innerHTML = 'Confirm Reservation';
            btn.disabled = false;
        }
    } catch (error) {
        console.error("Booking error details:", error);
        alert('Network sync issue. Your booking might have completed. Please check your inbox or call us.');
        btn.innerHTML = 'Confirm Reservation';
        btn.disabled = false;
    }
}

function sendBookingEmail() {
    const emailBtn = document.getElementById('sendEmailBtn');
    const statusMsg = document.getElementById('emailStatus');
    
    if (!bookingState || !bookingState.email) {
        statusMsg.style.display = 'block';
        statusMsg.style.color = '#ef4444'; 
        statusMsg.innerText = "Error: No email address found for this session.";
        return;
    }

    emailBtn.disabled = true;
    emailBtn.innerHTML = 'Sending Email...';
    statusMsg.style.display = 'block';
    statusMsg.style.color = '#a0aec0'; 
    statusMsg.innerText = "Connecting to mail server...";

    // Extract values cleanly and encode each property individually
    const name = encodeURIComponent(bookingState.name);
    const email = encodeURIComponent(bookingState.email);
    const phone = encodeURIComponent(bookingState.phone);
    const service = encodeURIComponent(bookingState.service);
    const price = encodeURIComponent(bookingState.price || 0);
    const date = selectedDate ? encodeURIComponent(`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`) : '';
    const time = encodeURIComponent(selectedTime || '');

    // Construct flattened independent URL parameters
    const queryString = `?action=sendEmail&name=${name}&email=${email}&phone=${phone}&service=${service}&price=${price}&date=${date}&time=${time}`;

    fetch(`${GOOGLE_SCRIPT_URL}${queryString}`, {
        method: 'GET',
        mode: 'no-cors'
    })
    .then(() => {
        emailBtn.innerHTML = 'Email Sent!';
        emailBtn.style.backgroundColor = '#22c55e'; 
        emailBtn.style.borderColor = '#22c55e';
        statusMsg.style.color = '#22c55e';
        statusMsg.innerText = `Confirmation sent to ${bookingState.email}!`;
    })
    .catch(error => {
        console.error('Email Dispatch Error:', error);
        emailBtn.disabled = false;
        emailBtn.innerHTML = 'Send by Email';
        statusMsg.style.color = '#ef4444';
        statusMsg.innerText = "Failed to send email. Please try again.";
    });
}

function resetBooking() {
    bookingState = { service: null, price: 0, date: null, time: null, name: '', phone: '', email: '' };
    selectedDate = null;
    selectedTime = null;
    currentStep = 1;
    currentDate = new Date();
    
    document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
    
    const cName = document.getElementById('clientName');
    const cPhone = document.getElementById('clientPhone');
    const cEmail = document.getElementById('clientEmail');
    const cNotes = document.getElementById('clientNotes');
    
    if (cName) cName.value = '';
    if (cPhone) cPhone.value = '';
    if (cEmail) cEmail.value = '';
    if (cNotes) cNotes.value = '';
    
    const container = document.getElementById('timeSlotsContainer');
    if (container) container.style.display = 'none';
    
    const successScreen = document.getElementById('bookingSuccess');
    if (successScreen) successScreen.classList.remove('active');
    
    const progressWizard = document.querySelector('.booking-progress');
    if (progressWizard) progressWizard.style.display = 'flex';
    
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.innerHTML = 'Confirm Reservation';
        confirmBtn.disabled = true;
    }
    
    const s1Next = document.getElementById('step1Next');
    const s2Next = document.getElementById('step2Next');
    if (s1Next) s1Next.disabled = true;
    if (s2Next) s2Next.disabled = true;
    
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById('step' + i + 'Indicator');
        if (indicator) {
            indicator.classList.remove('active', 'completed');
            if (i === 1) indicator.classList.add('active');
        }
    }
    
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    const step1 = document.getElementById('step1');
    if (step1) step1.classList.add('active');
    
    renderCalendar();
    // Add this inside your existing resetBooking() function to clear old validation flags
    const nameError = document.getElementById('nameError');
    const phoneError = document.getElementById('phoneError');
    const emailError = document.getElementById('emailError');
    const nameInput = document.getElementById('clientName');
    const phoneInput = document.getElementById('clientPhone');
    const emailInput = document.getElementById('clientEmail');

    if (nameError) nameError.style.display = 'none';
    if (phoneError) phoneError.style.display = 'none';
    if (emailError) emailError.style.display = 'none';

    if (nameInput) nameInput.style.borderColor = '';
    if (phoneInput) phoneInput.style.borderColor = '';
    if (emailInput) emailInput.style.borderColor = '';

    const emailBtn = document.getElementById('sendEmailBtn');
    const statusMsg = document.getElementById('emailStatus');
    if (emailBtn) {
        emailBtn.disabled = false;
        emailBtn.innerHTML = 'Send by Email';
        emailBtn.style.backgroundColor = ''; // Restores your default template CSS design
        emailBtn.style.borderColor = '';
    }
    if (statusMsg) {
        statusMsg.style.display = 'none';
        statusMsg.innerText = '';
    }
  }

document.addEventListener("DOMContentLoaded", function() {
    renderCalendar();
    // Inside your document.addEventListener("DOMContentLoaded", function() { ... })
const nameInput = document.getElementById('clientName');
const phoneInput = document.getElementById('clientPhone');
const emailInput = document.getElementById('clientEmail');

if (nameInput && phoneInput) {
    nameInput.addEventListener('input', validateForm);
    phoneInput.addEventListener('input', validateForm);
    if (emailInput) emailInput.addEventListener('input', validateForm);
    
    // Run once at startup to make sure button is disabled when empty
    validateForm();
}
});

