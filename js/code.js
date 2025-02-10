    // Copy code
    const copyButtonLabel = "Copy Code";

    // only pre elements that have a code as a child
    let blocks = document.querySelectorAll("pre:has(code)");

    blocks.forEach((block) => {
      // only add button if browser supports Clipboard API
      if (navigator.clipboard) {
        let button = document.createElement("button");

        button.innerText = copyButtonLabel;
        block.appendChild(button);

        button.addEventListener("click", async () => {
          await copyCode(block, button);
        });
      }
    });

    async function copyCode(block, button) {
      let code = block.querySelector("code");
      let text = code.innerText;

      await navigator.clipboard.writeText(text);

      // visual feedback that task is completed
      button.innerText = "Code Copied";

      setTimeout(() => {
        button.innerText = copyButtonLabel;
      }, 700);
    }