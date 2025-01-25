module.exports = function vitepressTableContainer() {
    return {
        name: "vitepress-table-container",
        enhanceAppSetup(ctx) {
            return `
        import { onMounted, watch } from 'vue'
        import { useRoute } from 'vitepress'

        export default {
          setup() {
            const route = useRoute()
            
            const wrapTables = () => {
              const tables = document.getElementsByTagName('table')
              Array.from(tables).forEach(table => {
                if (!table.parentElement.classList.contains('custom-table-container')) {
                  const wrapper = document.createElement('div')
                  wrapper.className = 'custom-table-container'
                  table.parentNode.insertBefore(wrapper, table)
                  wrapper.appendChild(table)
                }
              })
            }

            onMounted(() => {
              wrapTables()
            })

            watch(
              () => route.path,
              () => {
                setTimeout(wrapTables, 100)
              }
            )
          }
        }
      `;
        },
        enhanceAppFiles() {
            return {
                name: "vitepress-table-container-style",
                content: `
          .custom-table-container {
            display: flex;
            justify-content: center;
          }
        `,
            };
        },
    };
};
