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
    console.log("Button 2 clicked");
  });

  button3.addEventListener("click", function () {
    console.log("Button 3 clicked");
  });
});
