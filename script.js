const elements = {
  button: document.querySelector('[role="combobox"]'),
  dropdown: document.querySelector('[role="listbox"]'),
  options: document.querySelectorAll('[role="option"]'),
  announcement: document.getElementById("announcement"),
};

let isDropdownOpen = false;
let currentOptionIndex = 0;
let lastTypedChar = "";
let lastMatchingIndex = 0;

// La funcion toggleDropdownfunción agrega una activeclase al menú desplegable.
const toggleDropdown = () => {
  elements.dropdown.classList.toggle("active");
  isDropdownOpen = !isDropdownOpen;
  // update the aria-expanded state // actualizar el estado aria-expanded
  elements.button.setAttribute("aria-expanded", isDropdownOpen.toString()); 
  
  if (isDropdownOpen) {
    focusCurrentOption();
  } else {
    elements.button.focus();
  }
};

const handleKeyPress = (event) => {
  event.preventDefault();
  const { key } = event;
  const openKeys = ["ArrowDown", "ArrowUp", "Enter", " "];

  if (!isDropdownOpen && openKeys.includes(key)) {
    toggleDropdown();
  } else if (isDropdownOpen) {
    switch (key) {
      case "Escape":
        toggleDropdown();
        break;
      case "ArrowDown":
        moveFocusDown();
        break;
      case "ArrowUp":
        moveFocusUp();
        break;
      case "Enter":
      case " ":
        selectCurrentOption();
        break;
      default:
        // Handle alphanumeric key presses for mini-search
        handleAlphanumericKeyPress(key);
        break;
    }
  }
};

const handleDocumentInteraction = (event) => {
  const isClickInsideButton = elements.button.contains(event.target);
  const isClickInsideDropdown = elements.dropdown.contains(event.target);

  if (isClickInsideButton || (!isClickInsideDropdown && isDropdownOpen)) {
    toggleDropdown();
  }

  // Check if the click is on an option
  const clickedOption = event.target.closest('[role="option"]');
  if (clickedOption) {
    selectOptionByElement(clickedOption);
  }
};

const moveFocusDown = () => {
  if (currentOptionIndex < elements.options.length - 1) {
    currentOptionIndex++;
  } else {
    currentOptionIndex = 0;
  }
  focusCurrentOption();
};

const moveFocusUp = () => {
  if (currentOptionIndex > 0) {
    currentOptionIndex--;
  } else {
    currentOptionIndex = elements.options.length - 1;
  }
  focusCurrentOption();
};

const focusCurrentOption = () => {
  const currentOption = elements.options[currentOptionIndex];
  const optionLabel = currentOption.textContent;

  currentOption.classList.add("current");
  currentOption.focus();

  // Scroll the current option into view
  currentOption.scrollIntoView({
    block: "nearest",
  });

  elements.options.forEach((option, index) => {
    if (option !== currentOption) {
      option.classList.remove("current");
    }
  });
  announceOption(`You're currently focused on ${optionLabel}`); // Announce the selected option within a delayed period
};

const selectCurrentOption = () => {
  const selectedOption = elements.options[currentOptionIndex];
  selectOptionByElement(selectedOption);
};

const selectOptionByElement = (optionElement) => {
  const optionValue = optionElement.textContent;

  elements.button.textContent = optionValue;
  elements.options.forEach((option) => {
    option.classList.remove("active");
    option.setAttribute("aria-selected", "false");
  });

  optionElement.classList.add("active");
  optionElement.setAttribute("aria-selected", "true");

  toggleDropdown();
  announceOption(optionValue); // Announce the selected option
};

const handleAlphanumericKeyPress = (key) => {
  const typedChar = key.toLowerCase();

  if (lastTypedChar !== typedChar) {
    lastMatchingIndex = 0;
  }

  const matchingOptions = Array.from(elements.options).filter((option) =>
    option.textContent.toLowerCase().startsWith(typedChar)
  );

  if (matchingOptions.length) {
    if (lastMatchingIndex === matchingOptions.length) {
      lastMatchingIndex = 0;
    }
    let value = matchingOptions[lastMatchingIndex];
    const index = Array.from(elements.options).indexOf(value);
    currentOptionIndex = index;
    focusCurrentOption();
    lastMatchingIndex += 1;
  }
  lastTypedChar = typedChar;
};

const announceOption = (text) => {
  elements.announcement.textContent = text;
  elements.announcement.setAttribute("aria-live", "assertive");
  setTimeout(() => {
    elements.announcement.textContent = "";
    elements.announcement.setAttribute("aria-live", "off");
  }, 1000); // Announce and clear after 1 second (adjust as needed)
};

elements.button.addEventListener("keydown", handleKeyPress);
document.addEventListener("click", handleDocumentInteraction);
