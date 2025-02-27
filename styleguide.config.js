module.exports = {
    components: 'src/components/**/*.{js,jsx}',
    title: 'Elos Cloud Documentation',
    sections: [
      {
        name: 'Components',
        components: 'src/components/**/*.{js,jsx}',
        sectionDepth: 2
      },
      {
        name: 'Contexts',
        content: 'src/contexts/README.md',
        components: 'src/contexts/**/*.{js,jsx}'
      },
      {
        name: 'Services',
        content: 'src/services/README.md'
      }
    ],
    moduleAliases: {
      '@': path.resolve(__dirname, 'src')
    }
  }