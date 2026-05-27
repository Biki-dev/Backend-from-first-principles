import { marked } from 'marked';

const renderMarkdown = (content) => {
  return marked(content);
};

export default renderMarkdown;