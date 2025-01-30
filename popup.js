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
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          function: () => {
            const scrapedData = {};
            const selectors = [
              "input[name='empr_name']",
              "input[name='empr_phone']",
              "input[name='empr_address1']",
              "input[name='ref_first_name']",
              "input[name='ref_last_name']",
              "input[name='ref_relation_to']",
              "input[name='ref_phone']",
            ];

            selectors.forEach((selector) => {
              const el = document.querySelector(selector);
              scrapedData[selector] = el
                ? (el.value || el.innerText).trim()
                : "Not found";
            });
            return scrapedData;
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
            const scrapedData = injectionResults[0].result;
            const tsvString = createSingleRowTSV(scrapedData);
            copyToClipboard(tsvString);
          }
        }
      );
    });
  });
});
function createSingleRowTSV(scrapedData) {
  const firstName = scrapedData["input[name='ref_first_name']"];
  const lastName = scrapedData["input[name='ref_last_name']"];
  const relation = scrapedData["input[name='ref_relation_to']"];
  const combinedName = `${firstName} ${lastName} ${relation}`;
  const emprPhone = scrapedData["input[name='empr_phone']"];
  const refPhone = scrapedData["input[name='ref_phone']"];

  const formattedEmprPhone =
    emprPhone === "Not found"
      ? "Not found"
      : emprPhone.replace(/\D/g, "").substring(1);
  const formattedRefPhone =
    refPhone === "Not found"
      ? "Not found"
      : refPhone.replace(/\D/g, "").substring(1);

  const row = [
    scrapedData["input[name='empr_name']"],
    formattedEmprPhone,
    scrapedData["input[name='empr_address1']"],
    combinedName,
    formattedRefPhone,
  ];
  return row.join("\t");
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    function () {},
    function (err) {
      console.error("Could not copy text: ", err);
    }
  );
}
