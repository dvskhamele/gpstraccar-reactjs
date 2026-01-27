export const showLoader = () => {
  const loader = document.querySelector('.custom-loader');
  if (loader) {
    loader.style.display = 'flex';
  }
};

export const hideLoader = () => {
  const loader = document.querySelector('.custom-loader');
  if (loader) {
    loader.style.display = 'none';
  }
};
