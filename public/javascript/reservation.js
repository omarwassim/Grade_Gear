document.addEventListener('DOMContentLoaded', () => {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const priceInput = document.getElementById('price');
  const checkboxes = document.querySelectorAll('input[name="projectType[]"]');
  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;
  function calculateEstimates() {
    const startDate = new Date(startDateInput.value);
    if (!startDateInput.value || isNaN(startDate)) {
      endDateInput.value = '';
      priceInput.value = '';
      return;
    }
    let totalWeeks = 0;
    let totalPrice = 0;
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        totalWeeks += 2; 
        totalPrice += 500;
      }
    });
    if (totalWeeks === 0) {
      endDateInput.value = '';
      priceInput.value = '';
      return;
    }
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (totalWeeks * 7));
    const formattedEndDate = endDate.toISOString().split('T')[0];
    endDateInput.value = formattedEndDate;
    priceInput.value = totalPrice.toFixed(2); 
  }
  startDateInput.addEventListener('change', calculateEstimates);
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', calculateEstimates);
  });
  calculateEstimates();
});