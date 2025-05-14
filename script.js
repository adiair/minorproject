const doctorsData = [
    { id: 'dr1', name: 'Dr. Sarah Johnson', specialization: 'General Physician', symptoms: ['fever', 'cough', 'headache', 'fatigue'] },
    { id: 'dr2', name: 'Dr. Michael Chen', specialization: 'Cardiologist', symptoms: ['dizziness', 'fatigue'] },
    { id: 'dr3', name: 'Dr. Lisa Park', specialization: 'Pediatrician', symptoms: ['fever', 'cough', 'stomachache'] },
    { id: 'dr4', name: 'Dr. Robert Smith', specialization: 'Neurologist', symptoms: ['headache', 'dizziness'] },
    { id: 'dr5', name: 'Dr. Emily Wilson', specialization: 'Gastroenterologist', symptoms: ['stomachache'] }
];

const clinicsData = [
    { id: 'clinic1', name: 'City Health Clinic', distance: '1.2 km', address: '123 Health Street' },
    { id: 'clinic2', name: 'Wellness Medical Center', distance: '2.5 km', address: '456 Wellness Avenue' },
    { id: 'clinic3', name: 'Main Street Clinic', distance: '3.0 km', address: '789 Main Street' }
];

let appointments = [];
let pendingAppointments = [];

// DOM
const loginPage = document.getElementById('loginPage');
const userLoginTab = document.getElementById('userLoginTab');
const adminLoginTab = document.getElementById('adminLoginTab');
const userLoginForm = document.getElementById('userLoginForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const generateUsername = document.getElementById('generateUsername');
const username = document.getElementById('username');
const password = document.getElementById('password');
const emergency = document.getElementById('emergency');
const userLoginBtn = document.getElementById('userLoginBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');

const userLandingPage = document.getElementById('userLandingPage');
const logoutBtn = document.getElementById('logoutBtn');
const userTokenDisplay = document.getElementById('userTokenDisplay');
const symptomChips = document.querySelectorAll('.symptom-chip');
const selectedSymptoms = document.getElementById('selectedSymptoms');
const recommendedDoctors = document.getElementById('recommendedDoctors');
const doctorSelection = document.getElementById('doctorSelection');
const locationAccess = document.getElementById('locationAccess');
const nearestClinics = document.getElementById('nearestClinics');
const confirmAppointmentBtn = document.getElementById('confirmAppointmentBtn');

const receiptPage = document.getElementById('receiptPage');
const backToDashboard = document.getElementById('backToDashboard');
const printReceipt = document.getElementById('printReceipt');

const adminLandingPage = document.getElementById('adminLandingPage');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const pendingAppointmentsContainer = document.getElementById('pendingAppointments');
const selectToken = document.getElementById('selectToken');
const doctorAvailability = document.getElementById('doctorAvailability');


let currentUserToken = '';
let selectedSymptomsList = [];
let selectedDoctor = null;
let selectedClinic = null;
let isEmergency = false;
let currentUser = null;

// Event Listeners
userLoginTab.addEventListener('click', () => {
    userLoginTab.classList.add('bg-blue-600', 'text-white');
    userLoginTab.classList.remove('bg-gray-200', 'text-gray-700');
    adminLoginTab.classList.add('bg-gray-200', 'text-gray-700');
    adminLoginTab.classList.remove('bg-blue-600', 'text-white');
    userLoginForm.classList.remove('hidden');
    adminLoginForm.classList.add('hidden');
});

adminLoginTab.addEventListener('click', () => {
    adminLoginTab.classList.add('bg-blue-600', 'text-white');
    adminLoginTab.classList.remove('bg-gray-200', 'text-gray-700');
    userLoginTab.classList.add('bg-gray-200', 'text-gray-700');
    userLoginTab.classList.remove('bg-blue-600', 'text-white');
    adminLoginForm.classList.remove('hidden');
    userLoginForm.classList.add('hidden');
});

generateUsername.addEventListener('click', () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    username.value = `WC-${randomNum}`;
});

userLoginBtn.addEventListener('click', () => {
    if (!username.value || !password.value) {
        alert('Please generate a username and enter a password');
        return;
    }

    isEmergency = emergency.checked;
    currentUserToken = username.value;
    currentUser = {
        username: username.value,
        password: password.value,
        isEmergency: isEmergency
    };

    loginPage.classList.add('hidden');
    userLandingPage.classList.remove('hidden');

    // Set appointment
    const now = new Date();
    const appointmentDate = new Date(now.getTime() + (isEmergency ? 0 : 30 * 60000));

    document.getElementById('appointmentDate').valueAsDate = appointmentDate;
    document.getElementById('appointmentTime').value = `${String(appointmentDate.getHours()).padStart(2, '0')}:${String(appointmentDate.getMinutes()).padStart(2, '0')}`;

    // info panel
    document.getElementById('infoToken').textContent = currentUserToken;
    userTokenDisplay.textContent = currentUserToken;
    document.getElementById('infoStatus').textContent = 'Not booked';
    document.getElementById('infoWaitTime').textContent = isEmergency ? 'Immediate' : '30 minutes';
});

adminLoginBtn.addEventListener('click', () => {
    const adminUsername = document.getElementById('adminUsername').value;
    const adminPassword = document.getElementById('adminPassword').value;

    if (!adminUsername || !adminPassword) {
        alert('Please enter admin credentials');
        return;
    }

    loginPage.classList.add('hidden');
    adminLandingPage.classList.remove('hidden');

    // appointments for admin
    loadPendingAppointments();
    updateDoctorAvailability();
});

logoutBtn.addEventListener('click', () => {
    userLandingPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
    resetUserSession();
});

adminLogoutBtn.addEventListener('click', () => {
    adminLandingPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
});

backToDashboard.addEventListener('click', () => {
    receiptPage.classList.add('hidden');
    userLandingPage.classList.remove('hidden');
});

printReceipt.addEventListener('click', () => {
    window.print();
});

// Symptom selection
symptomChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const symptom = chip.getAttribute('data-symptom');

        if (selectedSymptomsList.includes(symptom)) {
            // Remove symptom
            selectedSymptomsList = selectedSymptomsList.filter(s => s !== symptom);
            chip.classList.remove('bg-blue-100', 'text-blue-700');
            chip.classList.add('bg-gray-100', 'text-gray-700');
        } else {
            // Add symptom
            selectedSymptomsList.push(symptom);
            chip.classList.add('bg-blue-100', 'text-blue-700');
            chip.classList.remove('bg-gray-100', 'text-gray-700');
        }

        updateSelectedSymptomsDisplay();
        recommendDoctors();
    });
});

locationAccess.addEventListener('change', () => {
    if (locationAccess.checked) {
        nearestClinics.classList.remove('hidden');
    
        displayNearbyClinics();
    } else {
        nearestClinics.classList.add('hidden');
    }
});

confirmAppointmentBtn.addEventListener('click', () => {
    const patientName = document.getElementById('patientName').value;
    const patientAge = document.getElementById('patientAge').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;

    if (!patientName || !patientAge || !appointmentDate || !appointmentTime) {
        alert('Please fill all the fields');
        return;
    }

    // Get clinic
    const selectedClinicRadio = document.querySelector('input[name="clinic"]:checked');
    if (locationAccess.checked && !selectedClinicRadio) {
        alert('Please select a clinic');
        return;
    }

    selectedClinic = locationAccess.checked ?
        clinicsData.find(clinic => clinic.id === selectedClinicRadio.id) :
        { name: 'Not specified', address: 'Will be assigned by admin' };

    // create appointment
    const appointment = {
        token: currentUserToken,
        patientName: patientName,
        patientAge: patientAge,
        symptoms: [...selectedSymptomsList],
        doctor: selectedDoctor,
        date: appointmentDate,
        time: appointmentTime,
        clinic: selectedClinic,
        status: 'Pending',
        isEmergency: isEmergency,
        createdAt: new Date().toISOString()
    };

    appointments.push(appointment);
    pendingAppointments.push(appointment);

    const dateObj = new Date(appointmentDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('receiptName').textContent = patientName;
    document.getElementById('receiptAge').textContent = patientAge;
    document.getElementById('receiptSymptoms').textContent = selectedSymptomsList.map(s =>
        s.charAt(0).toUpperCase() + s.slice(1)
    ).join(', ');
    document.getElementById('receiptDoctor').textContent = selectedDoctor.name;
    document.getElementById('receiptSpecialization').textContent = selectedDoctor.specialization;
    document.getElementById('receiptDateTime').textContent = `${formattedDate}, ${appointmentTime}`;
    document.getElementById('receiptLocation').textContent = `${selectedClinic.name}, ${selectedClinic.address}`;
    document.getElementById('receiptToken').textContent = currentUserToken;

    
    alert('Appointment Booked Successfully!');

    // Show receipt page
    userLandingPage.classList.add('hidden');
    receiptPage.classList.remove('hidden');
});

// Admin functionality
document.getElementById('assignDoctorBtn').addEventListener('click', () => {
    const token = selectToken.value;
    const doctorId = document.getElementById('selectDoctor').value;
    const appointmentTime = document.getElementById('appointmentTimeAdmin').value;

    if (!token || !doctorId || !appointmentTime) {
        alert('Please select token, doctor and appointment time');
        return;
    }

    // Find the appointment
    const appointmentIndex = pendingAppointments.findIndex(app => app.token === token);
    if (appointmentIndex === -1) {
        alert('Appointment not found');
        return;
    }

    const appointment = pendingAppointments[appointmentIndex];
    const doctor = doctorsData.find(d => d.id === doctorId);

    // Update appointment
    appointment.doctor = doctor;
    appointment.status = 'Confirmed';
    appointment.assignedAt = new Date().toISOString();

    // Move from pending to confirmed
    pendingAppointments.splice(appointmentIndex, 1);

    // Update UI
    loadPendingAppointments();
    updateDoctorAvailability();

    alert(`Doctor ${doctor.name} assigned to appointment ${token}`);
});

document.getElementById('previewReceiptBtn').addEventListener('click', () => {
    const token = document.getElementById('receiptTokenInput').value;
    const patientName = document.getElementById('receiptPatientName').value;
    const doctorName = document.getElementById('receiptDoctorName').value;
    const diagnosis = document.getElementById('receiptDiagnosis').value;
    const amount = document.getElementById('receiptAmount').value;

    if (!token || !patientName || !doctorName) {
        alert('Please fill in token, patient name and doctor name');
        return;
    }

    // Update preview
    document.getElementById('previewPatientName').textContent = patientName;
    document.getElementById('previewToken').textContent = token;
    document.getElementById('previewDoctor').textContent = doctorName;
    document.getElementById('previewDiagnosis').textContent = diagnosis || 'Not specified';
    document.getElementById('previewAmount').textContent = amount || '0';

    // Set current date
    const today = new Date();
    document.getElementById('previewDate').textContent = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Show preview
    document.getElementById('receiptPreview').classList.remove('hidden');
});

document.getElementById('generateReceiptBtn').addEventListener('click', () => {
    alert('Receipt generated successfully!');
});

// Helper Functions
function generateToken() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    currentUserToken = `WC-${randomNum}`;
    userTokenDisplay.textContent = currentUserToken;
}

function resetUserSession() {
    currentUserToken = '';
    selectedSymptomsList = [];
    selectedDoctor = null;
    selectedClinic = null;
    username.value = '';
    password.value = '';
    emergency.checked = false;

    // Reset symptom 
    symptomChips.forEach(chip => {
        chip.classList.add('bg-gray-100', 'text-gray-700');
        chip.classList.remove('bg-blue-100', 'text-blue-700');
    });

    // Clear displays
    selectedSymptoms.innerHTML = '';
    recommendedDoctors.innerHTML = '';
    doctorSelection.classList.add('hidden');
    nearestClinics.classList.add('hidden');
}

function updateSelectedSymptomsDisplay() {
    selectedSymptoms.innerHTML = '';
    selectedSymptomsList.forEach(symptom => {
        const chip = document.createElement('div');
        chip.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700';
        chip.innerHTML = `${symptom.charAt(0).toUpperCase() + symptom.slice(1)} <button class="ml-1 text-blue-500 hover:text-blue-700" data-symptom="${symptom}">&times;</button>`;
        selectedSymptoms.appendChild(chip);

        // Add event listener to remove button
        chip.querySelector('button').addEventListener('click', (e) => {
            e.stopPropagation();
            selectedSymptomsList = selectedSymptomsList.filter(s => s !== symptom);
            updateSelectedSymptomsDisplay();

            // Update symptom chip styling
            document.querySelector(`.symptom-chip[data-symptom="${symptom}"]`).classList.remove('bg-blue-100', 'text-blue-700');
            document.querySelector(`.symptom-chip[data-symptom="${symptom}"]`).classList.add('bg-gray-100', 'text-gray-700');

            recommendDoctors();
        });
    });
}

function recommendDoctors() {
    recommendedDoctors.innerHTML = '';

    if (selectedSymptomsList.length === 0) {
        return;
    }

    // Find doctors who specialize in the selected symptoms
    const matchedDoctors = doctorsData.filter(doctor => {
        return selectedSymptomsList.some(symptom => doctor.symptoms.includes(symptom));
    });

    if (matchedDoctors.length === 0) {
        recommendedDoctors.innerHTML = '<p class="text-gray-500">No doctors found for these symptoms. Please try different symptoms.</p>';
        return;
    }

    matchedDoctors.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors';
        doctorCard.innerHTML = `
                    <div class="flex items-start">
                        <div class="bg-blue-100 p-3 rounded-full mr-4">
                            <i class="fas fa-user-md text-blue-600"></i>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-800">${doctor.name}</h3>
                            <p class="text-sm text-gray-500">${doctor.specialization}</p>
                            <p class="text-xs text-gray-500 mt-1">Specializes in: ${doctor.symptoms.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</p>
                        </div>
                    </div>
                `;

        doctorCard.addEventListener('click', () => {
            selectedDoctor = doctor;
            doctorSelection.classList.remove('hidden');

            // Scroll to form
            doctorSelection.scrollIntoView({ behavior: 'smooth' });
        });

        recommendedDoctors.appendChild(doctorCard);
    });
}

function displayNearbyClinics() {
    nearestClinics.innerHTML = '';

    clinicsData.forEach(clinic => {
        const clinicDiv = document.createElement('div');
        clinicDiv.className = 'flex items-center p-3 border rounded-lg hover:bg-blue-50 cursor-pointer';
        clinicDiv.innerHTML = `
                    <input type="radio" name="clinic" id="${clinic.id}" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                    <label for="${clinic.id}" class="ml-3 block text-sm text-gray-700">
                        <span class="font-medium">${clinic.name}</span> - ${clinic.distance} away<br>
                        <span class="text-xs text-gray-500">${clinic.address}</span>
                    </label>
                `;

        nearestClinics.appendChild(clinicDiv);
    });
}

function loadPendingAppointments() {
    pendingAppointmentsContainer.innerHTML = '';
    selectToken.innerHTML = '<option value="">Select a token</option>';

    if (pendingAppointments.length === 0) {
        pendingAppointmentsContainer.innerHTML = '<p class="text-gray-500">No pending appointments</p>';
        return;
    }

    pendingAppointments.forEach(appointment => {
        // Add to pending appointments list
        const appointmentCard = document.createElement('div');
        appointmentCard.className = 'border rounded-lg p-4 hover:bg-blue-50 transition-colors';
        appointmentCard.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-medium text-gray-800">${appointment.patientName}</h3>
                            <p class="text-sm text-gray-500">Token: ${appointment.token}</p>
                            <p class="text-sm text-gray-500">Symptoms: ${appointment.symptoms.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}</p>
                        </div>
                        <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Pending</span>
                    </div>
                    <div class="mt-3 flex justify-between items-center">
                        <div>
                            <p class="text-sm text-gray-700">Requested: ${new Date(appointment.createdAt).toLocaleString()}</p>
                            <p class="text-sm text-gray-700">Age: ${appointment.patientAge}</p>
                            ${appointment.isEmergency ? '<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Emergency</span>' : ''}
                        </div>
                        <div class="flex space-x-2">
                            <button class="approveBtn px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200" data-token="${appointment.token}">
                                Approve
                            </button>
                            <button class="rejectBtn px-3 py-1 bg-red-100 text-red-800 text-sm rounded-md hover:bg-red-200" data-token="${appointment.token}">
                                Reject
                            </button>
                        </div>
                    </div>
                `;

        // Add event listeners to buttons
        appointmentCard.querySelector('.approveBtn').addEventListener('click', () => {
            selectToken.value = appointment.token;
            document.getElementById('appointmentTimeAdmin').value = formatDateTimeForInput(new Date());
        });

        appointmentCard.querySelector('.rejectBtn').addEventListener('click', () => {
            if (confirm(`Are you sure you want to reject appointment ${appointment.token}?`)) {
                const index = pendingAppointments.findIndex(app => app.token === appointment.token);
                if (index !== -1) {
                    pendingAppointments.splice(index, 1);
                    loadPendingAppointments();
                    alert('Appointment rejected');
                }
            }
        });

        pendingAppointmentsContainer.appendChild(appointmentCard);

        // Add to token dropdown
        const option = document.createElement('option');
        option.value = appointment.token;
        option.textContent = `${appointment.token} (${appointment.patientName})`;
        selectToken.appendChild(option);
    });
}

function updateDoctorAvailability() {
    doctorAvailability.innerHTML = '';

    // Count appointments per doctor
    const doctorAppointments = {};
    appointments.forEach(app => {
        if (app.doctor && app.status === 'Confirmed') {
            if (!doctorAppointments[app.doctor.id]) {
                doctorAppointments[app.doctor.id] = 0;
            }
            doctorAppointments[app.doctor.id]++;
        }
    });

    // Display availability
    doctorsData.forEach(doctor => {
        const appointmentCount = doctorAppointments[doctor.id] || 0;
        const isAvailable = appointmentCount < 5; 

        const doctorDiv = document.createElement('div');
        doctorDiv.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
        doctorDiv.innerHTML = `
                    <div>
                        <p class="font-medium">${doctor.name}</p>
                        <p class="text-sm text-gray-500">${doctor.specialization}</p>
                    </div>
                    <span class="${isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs px-2 py-1 rounded-full">
                        ${isAvailable ? 'Available' : `${appointmentCount} appointments`}
                    </span>
                `;

        doctorAvailability.appendChild(doctorDiv);
    });
}

function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
