document.addEventListener('DOMContentLoaded', () => {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const priceInput = document.getElementById('price');
  const checkboxes = document.querySelectorAll('input[name="projectType"]');
  function calculateEstimates() {
    const startDate = new Date(startDateInput.value);
    if (!startDate || isNaN(startDate)) {
      endDateInput.value = '';
      priceInput.value = '';
      return;
    }
    let weeksToAdd = 0;
    let totalPrice = 0;
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        weeksToAdd += 3; 
        totalPrice += 300; 
      }
    });
    if (weeksToAdd === 0) {
      endDateInput.value = 'N/A';
      priceInput.value = '$0';
      return;
    }
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + weeksToAdd * 7);
    const formattedEndDate = endDate.toISOString().split('T')[0];
    endDateInput.value = formattedEndDate;
    priceInput.value = `$${totalPrice}`;
  }
  startDateInput.addEventListener('change', calculateEstimates);
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', calculateEstimates);
  });
});