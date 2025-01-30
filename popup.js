document.addEventListener("DOMContentLoaded", function () {
  const button1 = document.getElementById("button1");
  const button2 = document.getElementById("button2");
  const button3 = document.getElementById("button3");
  const emailListTextArea = document.getElementById("emailList");

  button1.addEventListener("click", function () {
    const emailsText = emailListTextArea.value;
    const emails = emailsText
      .split("\n")
      .map((email) => email.trim())
      .filter((email) => email);

    emails.forEach((email) => {
      const encodedEmail = encodeURIComponent(email);
      const url = `https://loan.cashcowboy.net/customers/search-customers?filter=1&first=&last=&cell_number=&email=${encodedEmail}&address=&postal=&bank_account=&customer_id=`;
      chrome.tabs.create({ url: url });
    });
  });

  button2.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.tabs.query({ currentWindow: true }, function (allTabs) {
        const activeTabIndex = allTabs.findIndex(
          (tab) => tab.id === activeTab.id
        );
        const tabsToProcess = allTabs.slice(activeTabIndex);

        tabsToProcess.forEach((tab) => {
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              function: () => {
                const table = document.querySelector(
                  ".table.align-middle.table-condensed.table-row-dashed.fs-6.gy-1.gx-1"
                );
                if (table) {
                  const customerIds = Array.from(
                    table.querySelectorAll("tbody tr")
                  )
                    .map((row) => {
                      const idCell = row.querySelector("td");
                      if (idCell) {
                        return idCell.innerText.trim();
                      }
                      return null;
                    })
                    .filter((id) => id);
                  return customerIds;
                }
                return null;
              },
            },
            function (injectionResults) {
              if (chrome.runtime.lastError) {
                return console.error(chrome.runtime.lastError);
              }
              if (
                injectionResults &&
                injectionResults.length > 0 &&
                injectionResults[0].result
              ) {
                const customerIds = injectionResults[0].result;
                if (customerIds) {
                  customerIds.forEach((id) => {
                    const idNum = id.replace("CCB-", "");
                    const url = `https://loan.cashcowboy.net/customers/${idNum}`;
                    chrome.tabs.update(tab.id, { url: url });
                  });
                }
              }
            }
          );
        });
      });
    });
  });

  button3.addEventListener("click", function () {
    console.log("Button 3 clicked");
  });
});
