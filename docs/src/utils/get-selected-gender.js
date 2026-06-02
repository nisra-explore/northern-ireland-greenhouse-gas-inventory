export function getSelectedGender() {
  const checked = document.querySelector('input[name="gender-select"]:checked');
  return checked ? checked.value : null;
}
