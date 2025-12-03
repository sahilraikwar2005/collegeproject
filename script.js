// --- Yaha maine saare variables banaye hain ---
var TOTAL_BEDS = 50;
var tenants = [];
var complaints = [];
var visitors = [];
var activities = [];

// --- Jab page load hoga tab ye function chalega ---
window.onload = function() {
    loadData();             // Data load karega
    updateDashboard();      // Dashboard update karega
    renderTenants();        // Tenants ki list dikhayega
    renderRent();           // Rent list dikhayega
    renderComplaints();     // Complaints dikhayega
    renderVisitors();       // Visitors dikhayega
    updateComplaintDropdown(); // Form me naam bharega
};

// --- Navigation: Ek page se dusre page jane ke liye ---
function showSection(id) {
    var views = document.querySelectorAll('.section');
    // Saare section chupa rahe hain
    for (var i = 0; i < views.length; i++) {
        views[i].classList.remove('active');
    }
    // Sirf wahi dikha rahe hain jispe click kiya
    document.getElementById(id).classList.add('active');
    
    // Menu color change karne ke liye logic
    var navItems = document.querySelectorAll('.nav-item');
    for (var j = 0; j < navItems.length; j++) {
        navItems[j].classList.remove('active');
        // Check kar rahe hain ki click kispe hua
        if (navItems[j].getAttribute('onclick').indexOf(id) !== -1) {
            navItems[j].classList.add('active');
        }
    }
}

// --- Data Save aur Load karne ka kaam (LocalStorage) ---

function saveData() {
    // Data ko text bana ke browser me save kar rahe hain
    localStorage.setItem('hms_tenants', JSON.stringify(tenants));
    localStorage.setItem('hms_complaints', JSON.stringify(complaints));
    localStorage.setItem('hms_visitors', JSON.stringify(visitors));
    localStorage.setItem('hms_activities', JSON.stringify(activities));
    updateDashboard(); // Save hone ke baad dashboard wapas update hoga
}

function loadData() {
    var t = localStorage.getItem('hms_tenants');
    var c = localStorage.getItem('hms_complaints');
    var v = localStorage.getItem('hms_visitors');
    var a = localStorage.getItem('hms_activities');

    // Agar data hai to use karo, nahi to khali array
    if (t) {
        tenants = JSON.parse(t);
    } else {
        seedData(); // Fake data daal do agar pehli baar khola hai
    }

    if (c) complaints = JSON.parse(c);
    if (v) visitors = JSON.parse(v);
    if (a) activities = JSON.parse(a);
}

// Fake data daalne ke liye function
function seedData() {
    tenants = [
        { id: 1, name: "Alice Smith", phone: "555-0101", room: "101", rentAmount: 5000, rentPaid: true, joined: "2023-10-01" },
        { id: 2, name: "Bob Jones", phone: "555-0102", room: "102", rentAmount: 4500, rentPaid: false, joined: "2023-10-05" }
    ];
    complaints = [
        { id: 101, tenantName: "Bob Jones", issue: "Leaky tap in bathroom", status: "Pending" }
    ];
    logActivity("System", "Initial demo data loaded");
    saveData();
}

function resetData() {
    var check = confirm("Kya aap sara data delete karna chahte hain?");
    if (check == true) {
        localStorage.clear();
        location.reload();
    }
}

function logActivity(type, desc) {
    var time = new Date().toLocaleTimeString();
    var activity = { 
        type: type, 
        desc: desc, 
        time: time 
    };
    
    // Naya activity sabse upar add kar rahe hain
    activities.unshift(activity);
    
    // Agar 5 se zyada ho gayi to purani hata do
    if (activities.length > 5) {
        activities.pop();
    }
    saveData();
}

// --- Dashboard Update karne ka logic ---
function updateDashboard() {
    var occupied = tenants.length;
    var vacant = TOTAL_BEDS - occupied;
    
    // Pending complaints gin rahe hain loop laga ke
    var pending = 0;
    for (var i = 0; i < complaints.length; i++) {
        if (complaints[i].status === "Pending") {
            pending++;
        }
    }
    
    var occupancyRate = Math.round((occupied / TOTAL_BEDS) * 100);

    document.getElementById('occupancy-rate').innerText = occupancyRate + "%";
    document.getElementById('vacant-beds').innerText = vacant;
    document.getElementById('pending-complaints').innerText = pending;

    // Recent Activity Table update
    var activityBody = document.getElementById('activity-log-body');
    var html = "";
    
    // Simple for loop HTML banane ke liye
    for (var j = 0; j < activities.length; j++) {
        var act = activities[j];
        html = html + "<tr>";
        html = html + "<td><span class='status-badge bg-gray-100'>" + act.type + "</span></td>";
        html = html + "<td>" + act.desc + "</td>";
        html = html + "<td style='color: gray; font-size: 0.85rem;'>" + act.time + "</td>";
        html = html + "</tr>";
    }
    activityBody.innerHTML = html;
}

// --- Allocation Section Logic ---

var allocationForm = document.getElementById('allocation-form');
if (allocationForm) {
    allocationForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Page refresh hone se roka
        
        var name = document.getElementById('tenant-name').value;
        var phone = document.getElementById('tenant-phone').value;
        var room = document.getElementById('room-no').value;
        var rent = document.getElementById('rent-amount').value;

        // Date nikalne ka simple tareeka
        var today = new Date().toISOString().split('T')[0];

        var newTenant = {
            id: Date.now(),
            name: name,
            phone: phone,
            room: room,
            rentAmount: parseInt(rent),
            rentPaid: false,
            joined: today
        };

        tenants.push(newTenant);
        
        // Log update aur save
        logActivity("Allocation", "Room " + room + " assigned to " + name);
        saveData();
        renderTenants();
        renderRent();
        updateComplaintDropdown();
        showToast("Tenant add ho gaya!", "success");
        
        // Form clear karna
        allocationForm.reset();
    });
}

function renderTenants() {
    var tbody = document.getElementById('tenants-body');
    if (!tbody) return;
    
    if (tenants.length === 0) {
        tbody.innerHTML = "<tr><td colspan='4' style='text-align:center'>Koi tenant nahi hai.</td></tr>";
        return;
    }

    var html = "";
    for (var i = 0; i < tenants.length; i++) {
        var t = tenants[i];
        html = html + "<tr>";
        html = html + "<td><div style='font-weight:600'>" + t.name + "</div><div style='font-size:0.8rem; color: gray'>" + t.phone + "</div></td>";
        html = html + "<td>" + t.room + "</td>";
        html = html + "<td>" + t.joined + "</td>";
        html = html + "<td><button class='btn btn-sm btn-danger' onclick='removeTenant(" + t.id + ")'>Evict</button></td>";
        html = html + "</tr>";
    }
    tbody.innerHTML = html;
}

function removeTenant(id) {
    var check = confirm("Kya aap is tenant ko hatana chahte hain?");
    if (check == true) {
        // Filter ka simple logic loop se
        var newTenants = [];
        for (var i = 0; i < tenants.length; i++) {
            if (tenants[i].id !== id) {
                newTenants.push(tenants[i]);
            }
        }
        tenants = newTenants;
        
        saveData();
        renderTenants();
        renderRent();
        updateComplaintDropdown();
        showToast("Tenant hataya gaya.", "info");
    }
}

// --- Rent Tracker Logic ---

function renderRent() {
    var tbody = document.getElementById('rent-body');
    if (!tbody) return;

    var html = "";
    for (var i = 0; i < tenants.length; i++) {
        var t = tenants[i];
        
        // If else se check kar rahe hain ki paid hai ya nahi
        var statusClass = "";
        var statusText = "";
        var actionBtn = "";

        if (t.rentPaid == true) {
            statusClass = "bg-green-100";
            statusText = "Paid";
            actionBtn = "<button class='btn btn-sm btn-warning' onclick='markRentUnpaid(" + t.id + ")'>Undo</button>";
        } else {
            statusClass = "bg-red-100";
            statusText = "Unpaid";
            actionBtn = "<button class='btn btn-sm btn-success' onclick='markRentPaid(" + t.id + ")'>Mark Paid</button>";
        }

        html = html + "<tr>";
        html = html + "<td>" + t.name + "</td>";
        html = html + "<td>" + t.room + "</td>";
        html = html + "<td>$" + t.rentAmount + "</td>";
        html = html + "<td><span class='status-badge " + statusClass + "'>" + statusText + "</span></td>";
        html = html + "<td>" + actionBtn + "</td>";
        html = html + "</tr>";
    }
    tbody.innerHTML = html;
}

function markRentPaid(id) {
    // Loop se dhoond rahe hain tenant ko
    for (var i = 0; i < tenants.length; i++) {
        if (tenants[i].id === id) {
            tenants[i].rentPaid = true;
            logActivity("Payment", "Rent mila: " + tenants[i].name);
            saveData();
            renderRent();
            showToast("Rent Paid mark kar diya", "success");
            break; // Mil gaya to loop band
        }
    }
}

function markRentUnpaid(id) {
    for (var i = 0; i < tenants.length; i++) {
        if (tenants[i].id === id) {
            tenants[i].rentPaid = false;
            saveData();
            renderRent();
            break;
        }
    }
}

// --- Complaints Logic ---

function updateComplaintDropdown() {
    var select = document.getElementById('complaint-tenant');
    if (!select) return;

    var html = "<option value=''>Select Tenant</option>";
    for (var i = 0; i < tenants.length; i++) {
        html = html + "<option value='" + tenants[i].name + "'>" + tenants[i].name + " (Room " + tenants[i].room + ")</option>";
    }
    select.innerHTML = html;
}

var complaintForm = document.getElementById('complaint-form');
if (complaintForm) {
    complaintForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = document.getElementById('complaint-tenant').value;
        var desc = document.getElementById('complaint-desc').value;

        var newComplaint = {
            id: Math.floor(Math.random() * 10000),
            tenantName: name,
            issue: desc,
            status: "Pending"
        };
        
        complaints.push(newComplaint);
        
        logActivity("Complaint", "Issue reported: " + name);
        saveData();
        renderComplaints();
        showToast("Complaint register ho gayi", "warning");
        complaintForm.reset();
    });
}

function renderComplaints() {
    var tbody = document.getElementById('complaints-body');
    if (!tbody) return;

    var html = "";
    for (var i = 0; i < complaints.length; i++) {
        var c = complaints[i];
        
        var badgeClass = "";
        var actionHtml = "";
        
        if (c.status === "Resolved") {
            badgeClass = "bg-green-100";
            actionHtml = "<span style='color:green;'>Done</span>";
        } else {
            badgeClass = "bg-yellow-100";
            actionHtml = "<button class='btn btn-sm btn-primary' onclick='resolveComplaint(" + c.id + ")'>Resolve</button>";
        }

        html = html + "<tr>";
        html = html + "<td>#" + c.id + "</td>";
        html = html + "<td>" + c.tenantName + "</td>";
        html = html + "<td>" + c.issue + "</td>";
        html = html + "<td><span class='status-badge " + badgeClass + "'>" + c.status + "</span></td>";
        html = html + "<td>" + actionHtml + "</td>";
        html = html + "</tr>";
    }
    tbody.innerHTML = html;
}

function resolveComplaint(id) {
    for (var i = 0; i < complaints.length; i++) {
        if (complaints[i].id === id) {
            complaints[i].status = "Resolved";
            logActivity("Maintenance", "Ticket #" + id + " solved");
            saveData();
            renderComplaints();
            showToast("Complaint solve ho gayi", "success");
            break;
        }
    }
}

// --- Visitor Log Logic ---

var visitorForm = document.getElementById('visitor-form');
if (visitorForm) {
    visitorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var visitorName = document.getElementById('visitor-name').value;
        var target = document.getElementById('visitor-target').value;
        var purpose = document.getElementById('visitor-purpose').value;
        
        var now = new Date();
        var newVisitor = {
            name: visitorName,
            target: target,
            purpose: purpose,
            inTime: now.toLocaleTimeString(),
            outTime: "-"
        };
        
        visitors.unshift(newVisitor);
        
        if (visitors.length > 20) {
            visitors.pop();
        }

        saveData();
        renderVisitors();
        showToast("Visitor ki entry ho gayi", "info");
        visitorForm.reset();
    });
}

function renderVisitors() {
    var tbody = document.getElementById('visitors-body');
    if (!tbody) return;

    var html = "";
    // Note: Loop me index 'i' ka use button ke liye kar rahe hain
    for (var i = 0; i < visitors.length; i++) {
        var v = visitors[i];
        
        var exitButton = "";
        if (v.outTime === '-') {
            exitButton = "<button class='btn btn-sm btn-warning' onclick='visitorOut(" + i + ")'>Exit</button>";
        } else {
            exitButton = v.outTime;
        }

        html = html + "<tr>";
        html = html + "<td>" + v.name + "</td>";
        html = html + "<td>" + v.target + "</td>";
        html = html + "<td>" + v.purpose + "</td>";
        html = html + "<td>" + v.inTime + "</td>";
        html = html + "<td>" + exitButton + "</td>";
        html = html + "</tr>";
    }
    tbody.innerHTML = html;
}

function visitorOut(index) {
    var time = new Date().toLocaleTimeString();
    visitors[index].outTime = time;
    saveData();
    renderVisitors();
    showToast("Visitor chala gaya", "info");
}

// --- Popup Message (Toast) Logic ---
function showToast(message, type) {
    // Agar type nahi diya to default info
    if (!type) {
        type = 'info';
    }

    var container = document.getElementById('toast-container');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast';
    
    var icon = 'info';
    if(type === 'success') icon = 'check-circle';
    if(type === 'warning') icon = 'warning';
    
    toast.innerHTML = "<i class='ph ph-" + icon + "' style='font-size:1.2rem'></i> " + message;
    
    // Style set kar rahe hain
    if(type === 'success') toast.style.borderLeft = "4px solid #10b981";
    if(type === 'warning') toast.style.borderLeft = "4px solid #f59e0b";
    if(type === 'info') toast.style.borderLeft = "4px solid #4F46E5";

    container.appendChild(toast);

    // 3 second baad hata denge
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}