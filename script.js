const BASE_URL = 'https://fordemo-ot4j.onrender.com/users';

const viewUsersBtn = document.getElementById('viewUsersBtn');
const manageResult = document.getElementById('manageResult');

const addUsername = document.getElementById('addUsername');
const addPassword = document.getElementById('addPassword');
const addUserBtn = document.getElementById('addUserBtn');
const addMessage = document.getElementById('addMessage');

const fetchIdentifier = document.getElementById('fetchIdentifier');
const fetchUserBtn = document.getElementById('fetchUserBtn');
const fetchResult = document.getElementById('fetchResult');

const updateSection = document.getElementById('updateSection');
const updateUserId = document.getElementById('updateUserId');
const updateUsername = document.getElementById('updateUsername');
const updatePassword = document.getElementById('updatePassword');
const updateUserBtn = document.getElementById('updateUserBtn');
const updateMessage = document.getElementById('updateMessage');

const deleteUserIdInput = document.getElementById('deleteUserId');
const deleteUserBtn = document.getElementById('deleteUserBtn');
const deleteMessage = document.getElementById('deleteMessage');

let userToUpdate = null;

// --- View all users ---
async function fetchUsers() {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.users || [];
  } catch(err) {
    console.error(err);
    return [];
  }
}

// --- Display users ---
function displayUsers(users) {
  if (!users.length) {
    manageResult.innerHTML = '<p>No users found.</p>';
    return;
  }
  manageResult.innerHTML = users.map(u => `
    <div class="user-card">
      <div class="user-info">
        <strong>${u.username || '(no username)'}</strong> (ID: ${u._id})<br>
        Code: ${u.code || '(no code)'}
      </div>
      <button class="deleteBtn" data-id="${u._id}">Delete</button>
    </div>
  `).join('');

  document.querySelectorAll('.deleteBtn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const id = btn.dataset.id;
    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      btn.parentElement.remove();

      manageResult.innerHTML = `<p class="success">User with ID <span style="color:#35e9c8;">${id}</span> deleted successfully!</p>`;

    } catch(err) {
      console.error(err);
      manageResult.innerHTML = `<p class="error">Failed to delete user with ID <span style="color:#ff6b6b;">${id}</span>.</p>`;
    }
  });
});

}
let usersVisible = false;
let currentUsers = [];

viewUsersBtn.addEventListener('click', async () => {
  if (!usersVisible) {
    currentUsers = await fetchUsers();
    displayUsers(currentUsers);
    viewUsersBtn.textContent = 'Hide Users';
    usersVisible = true;
  } else {
    manageResult.innerHTML = '';
    viewUsersBtn.textContent = 'View All Users';
    usersVisible = false;
  }
});

addUserBtn.addEventListener('click', async () => {
  const username = addUsername.value.trim();
  const password = addPassword.value.trim();
  if (!username || !password) {
    addMessage.innerHTML = '<p class="error">Username and Password required.</p>';
    return;
  }

  try {
    await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const users = await fetchUsers();
    const newUser = users.find(u => u.username === username);
    if (!newUser) throw new Error('User not found after adding');

    addMessage.innerHTML = `<p class="success">
      User added successfully!<br>
      <strong>ID:</strong> ${newUser._id}<br>
      <strong>Code:</strong> ${newUser.code}
    </p>`;

    if (usersVisible) {
      currentUsers.push(newUser);
      displayUsers(currentUsers);
    }

    addUsername.value = '';
    addPassword.value = '';
  } catch(err) {
    console.error(err);
    addMessage.innerHTML = '<p class="error">Failed to add user.</p>';
  }
});

deleteUserBtn.addEventListener('click', async () => {
  const id = deleteUserIdInput.value.trim();
  if (!id) {
    deleteMessage.innerHTML = '<p class="error">Please enter a User ID.</p>';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Delete failed (HTTP ${res.status})`);

    deleteMessage.innerHTML = `<p class="success">User with ID <span style="color:#35e9c8;">${id}</span> deleted successfully!</p>`;

    deleteUserIdInput.value = '';

    const card = document.querySelector(`.deleteBtn[data-id="${id}"]`);
    if (card) card.parentElement.remove();

  } catch (err) {
    console.error(err);
    deleteMessage.innerHTML = `<p class="error">Failed to delete user with ID <span style="color:#ff6b6b;">${id}</span>.</p>`;
  }
});


// --- Fetch User ---
fetchUserBtn.addEventListener('click', async () => {
  const identifier = fetchIdentifier.value.trim();
  if (!identifier) {
    fetchResult.style.display = 'block';
    fetchResult.innerHTML = '<p class="error">Enter a User ID or Code.</p>';
    updateSection.style.display = 'none';
    return;
  }

  const users = await fetchUsers();
  const user = users.find(u => u._id === identifier || u.code === identifier);

  if (!user) {
    fetchResult.style.display = 'block';
    fetchResult.innerHTML = '<p class="error">User not found.</p>';
    updateSection.style.display = 'none';
    return;
  }

  userToUpdate = user;
  fetchResult.style.display = 'block';
  fetchResult.innerHTML = `<p>
    <strong>ID:</strong> <span style="color:#35e9c8;">${user._id}</span><br>
    <strong>Username:</strong> ${user.username}<br>
    <strong>Code:</strong> ${user.code}
  </p>`;

  updateUserId.textContent = user._id;
  updateUsername.value = user.username || '';
  updatePassword.value = '';
  updateSection.style.display = 'block';
  updateMessage.innerHTML = '';
});

updateUserBtn.addEventListener('click', async () => {
  if (!userToUpdate) return;

  const newUsername = updateUsername.value.trim();
  const newPassword = updatePassword.value.trim();

  if (!newUsername && !newPassword) {
    updateMessage.innerHTML = '<p class="error">Enter at least one field to update.</p>';
    return;
  }

  let updateData = {};
  if (newUsername) updateData.username = newUsername;
  if (newPassword) updateData.password = newPassword;

  try {
    await fetch(`${BASE_URL}/${userToUpdate._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    fetchResult.innerHTML = `<p>
      <strong>ID:</strong> ${userToUpdate._id}<br>
      <strong>Username:</strong> ${newUsername || userToUpdate.username}<br>
      <strong>Code:</strong> ${userToUpdate.code}<br>
      <strong>Password:</strong> ****** 
    </p>`;

    updateMessage.innerHTML = '<p class="success">User updated successfully!</p>';

    if (newUsername) userToUpdate.username = newUsername;
    if (newPassword) userToUpdate.password = newPassword;

fetchCode.value = '';
updateUsername.value = '';
updatePassword.value = '';


  } catch(err) {
    console.error(err);
    fetchResult.innerHTML = `<p>
      <strong>ID:</strong> ${userToUpdate._id}<br>
      <strong>Username:</strong> ${newUsername || userToUpdate.username}<br>
      <strong>Code:</strong> ${userToUpdate.code}<br>
      <strong>Password:</strong> ****** 
    </p>`;
    updateMessage.innerHTML = '<p class="success">User updated locally (backend may not have applied it).</p>';
  }
});

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

function showSection(sectionId) {
  sections.forEach(sec => {
    if (sec.id === sectionId) {
      sec.style.display = 'block';
    } else {
      sec.style.display = 'none';
    }
  });
}

showSection('manage');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const targetId = link.getAttribute('href').substring(1);
    showSection(targetId);
  });
});