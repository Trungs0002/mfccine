
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.seat:not(.sold)').forEach((seat) => {
    seat.addEventListener('click', () => seat.classList.toggle('sel'));
  });
});
