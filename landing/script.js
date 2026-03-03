document.getElementById('emailForm').addEventListener('submit', function(e) {
  const container = this.querySelector('.form-container');
  const confirmMsg = this.querySelector('#confirmMsg');
  setTimeout(function() {
    container.style.display = 'none';
    confirmMsg.style.display = 'block';
  }, 500);
});

document.getElementById('emailForm2').addEventListener('submit', function(e) {
  const container = this.querySelector('.form-container');
  const confirmMsg = this.querySelector('#confirmMsg2');
  setTimeout(function() {
    container.style.display = 'none';
    confirmMsg.style.display = 'block';
  }, 500);
});

// View tabs functionality
document.querySelectorAll('.view-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    const viewType = this.getAttribute('data-view');

    // Update active tab
    document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');

    // Update active panel
    document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById(viewType + '-view').classList.add('active');
  });
});
