let bookingState = { service: null, price: 0, date: null, time: null, name: '', phone: '', email: '' };
let currentStep = 1;
let currentDate = new Date(); // Current project timeline date layout Context (June 2026)
let selectedDate = null;
let selectedTime = null;

// Header transformation on scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
});

// Modern UI Layout Content Reveal Engine
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('animate-in');
    observer.observe(el);
});

// Animation Fallback Execution
setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('visible');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
}, 1500);

// NAVIGATION HANDLERS (FIXED)
function toggleMobileMenu() {
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('menuBtn');
    nav.classList.toggle('active');
    btn.classList.toggle('active');
}

// FORM STEPPING WIZARD (FIXED)
function goToStep(step) {
    if (step === 2 && !bookingState.service) return;
    if (step === 3 && (!selectedDate || !selectedTime)) return;
    
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
    
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById('step' + i + 'Indicator');
        indicator.classList.remove('active', 'completed');
        if (i < step) indicator.classList.add('completed');
        else if (i === step) indicator.classList.add('active');
    }
    currentStep = step;
    if (step === 3) updateSummary();
}

function selectService(element) {
    document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    bookingState.service = element.dataset.service;
    bookingState.price = parseInt(element.dataset.price);
    document.getElementById('step1Next').disabled = false;
}

// Selection enhancement directly from the upper service grid cards
function selectServiceFromCard(name, price) {
    const options = document.querySelectorAll('.service-option');
    options.forEach(opt => { 
        if (opt.dataset.service === name) {
            selectService(opt);
        }
    });
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    // Advance UX directly to step 2 selection once a showcase card item is clicked
    setTimeout(() => { goToStep(2); }, 400);
}

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];



function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    renderCalendar();
    renderTimeSlots();
    document.getElementById('timeSlotsContainer').style.display = 'block';
    selectedTime = null;
    document.getElementById('step2Next').disabled = true;
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    document.getElementById('currentMonth').textContent = monthNames[month] + ' ' + year;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); 
    
    // FIX: Disable backward navigation if viewing the initial baseline month
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    document.getElementById('prevMonth').disabled = isCurrentMonth;
    
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
            html += '<div class="' + classes + '">' + day + '</div>';
        } else {
            html += `<div class="${classes}" onclick="selectDate(${year}, ${month}, ${day})">${day}</div>`;
        }
    }
    document.getElementById('calendarGrid').innerHTML = html;
}

function changeMonth(delta) {
    // FIX: Prevent rollover calendar skips on safe day variants
    currentDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

function renderTimeSlots() {
    const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'];
    const day = selectedDate ? selectedDate.getDay() : -1;
    let html = '';
    
    slots.forEach((time, index) => {
        // FIX: Changed index < 6 to index < 8 to respect Friday's 2:00 PM (14:00) opening hour rule
        const isDisabled = (index === 2 || index === 7 || index === 12) || (day === 5 && index < 8);
        const isSelected = selectedTime === time;
        
        let classes = 'time-slot';
        if (isDisabled) classes += ' disabled';
        if (isSelected) classes += ' selected';
        
        if (isDisabled) {
            html += '<div class="' + classes + '">' + time + '</div>';
        } else {
            html += `<div class="${classes}" onclick="selectTime(this, '${time}')">${time}</div>`;
        }
    });
    document.getElementById('timeGrid').innerHTML = html;
}

function renderTimeSlots() {
    const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00'];
    const day = selectedDate ? selectedDate.getDay() : -1;
    let html = '';
    
    slots.forEach((time, index) => {
        // Mocking some business booking logic variants per slot criteria safely
        const isDisabled = (index === 2 || index === 7 || index === 12) || (day === 5 && index < 6);
        const isSelected = selectedTime === time;
        
        let classes = 'time-slot';
        if (isDisabled) classes += ' disabled';
        if (isSelected) classes += ' selected';
        
        if (isDisabled) {
            html += '<div class="' + classes + '">' + time + '</div>';
        } else {
            // FIXED: Standard template string literal encapsulation to completely eliminate unexpected quote breaking syntax anomalies
            html += `<div class="${classes}" onclick="selectTime(this, '${time}')">${time}</div>`;
        }
    });
    document.getElementById('timeGrid').innerHTML = html;
}

function selectTime(element, time) {
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    selectedTime = time;
    document.getElementById('step2Next').disabled = false;
}

function updateSummary() {
    document.getElementById('summaryService').textContent = bookingState.service;
    document.getElementById('summaryDate').textContent = selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '-';
    document.getElementById('summaryTime').textContent = selectedTime || '-';
    document.getElementById('summaryPrice').textContent = bookingState.price.toLocaleString() + ' DZD';
}

function validateForm() {
    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const isValid = name.length > 2 && phone.length > 8 && email.includes('@') && email.includes('.');
    document.getElementById('confirmBtn').disabled = !isValid;
}

function submitBooking() {
    const btn = document.getElementById('confirmBtn');
    btn.innerHTML = '<span class="spinner"></span>Processing...';
    btn.disabled = true;
    
    bookingState.name = document.getElementById('clientName').value.trim();
    bookingState.phone = document.getElementById('clientPhone').value.trim();
    bookingState.email = document.getElementById('clientEmail').value.trim();
    
    setTimeout(() => {
        document.getElementById('bookingSuccess').classList.add('active');
        document.getElementById('step3').classList.remove('active');
        document.getElementById('bookingForm').querySelector('.booking-progress').style.display = 'none';
        
        document.getElementById('successService').textContent = bookingState.service;
        document.getElementById('successDate').textContent = selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        document.getElementById('successTime').textContent = selectedTime;
        document.getElementById('successName').textContent = bookingState.name;
    }, 1500);
}

function resetBooking() {
    bookingState = { service: null, price: 0, date: null, time: null, name: '', phone: '', email: '' };
    selectedDate = null;
    selectedTime = null;
    currentStep = 1;
    currentDate = new Date();
    
    document.querySelectorAll('.service-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('clientName').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientEmail').value = '';
    document.getElementById('clientNotes').value = '';
    
    document.getElementById('timeSlotsContainer').style.display = 'none';
    document.getElementById('bookingSuccess').classList.remove('active');
    document.getElementById('bookingForm').querySelector('.booking-progress').style.display = 'flex';
    
    document.getElementById('confirmBtn').innerHTML = 'Confirm Reservation';
    document.getElementById('confirmBtn').disabled = true;
    document.getElementById('step1Next').disabled = true;
    document.getElementById('step2Next').disabled = true;
    
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById('step' + i + 'Indicator');
        indicator.classList.remove('active', 'completed');
        if (i === 1) indicator.classList.add('active');
    }
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
    renderCalendar();
}

// Initializing the application scripts safely 
document.addEventListener("DOMContentLoaded", function() {
    renderCalendar();
});