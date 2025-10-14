export const injectStyles = (stylesUrl: string) => {
  const id = 'equos-styles';

  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = stylesUrl;

    document.head.appendChild(link);
  }
};
