<!DOCTYPE html>
<html lang="en">

<head>
  <title>Chat GPT Laravel | Code with Ross</title>
  <link rel="icon" href="https://assets.edlin.app/favicon/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

  <!-- JavaScript -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.3/jquery.min.js"></script>
  <!-- End JavaScript -->

  <!-- CSS -->
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    }

    .chat {
      max-width: 600px;
      margin: 50px auto;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 500px;
    }

    .top {
      background-color: #007bff;
      padding: 15px;
      color: white;
      text-align: center;
    }

    .top p {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }

    .top small {
      font-size: 14px;
    }

    .messages {
      padding: 20px;
      flex-grow: 1;
      overflow-y: auto;
      background-color: #f9f9f9;
      display: flex;
      flex-direction: column;
    }

    .message {
      display: flex;
      margin-bottom: 15px;
    }

    .message p {
      background-color: #e6e6e6;
      padding: 12px;
      border-radius: 8px;
      margin: 0;
      max-width: 80%;
      line-height: 1.5;
      font-size: 16px;
    }

    .right p {
      background-color: #007bff;
      color: white;
      text-align: right;
    }

    .bottom {
      padding: 15px;
      background-color: #f1f1f1;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .bottom input[type="text"] {
      width: 85%;
      padding: 12px 15px;
      border-radius: 30px;
      border: 1px solid #ddd;
      font-size: 16px;
      background-color: #fff;
      box-sizing: border-box;
    }

    .bottom button {
      background-color: #007bff;
      border: none;
      padding: 12px 18px;
      border-radius: 30px;
      cursor: pointer;
      color: white;
      font-size: 16px;
      transition: background-color 0.3s ease;
    }

    .bottom button:disabled {
      background-color: #ddd;
      cursor: not-allowed;
    }

    .bottom button:hover {
      background-color: #0056b3;
    }
  </style>
  <!-- End CSS -->
</head>

<body>
  <div class="chat">

    <!-- Header -->
    <div class="top">
      <p>HI there</p>
      <small>Online</small>
    </div>
    <!-- End Header -->

    <!-- Chat -->
    <div class="messages">
      <div class="left message">
        <p>Start chatting with Chat GPT AI below!!</p>
      </div>
    </div>
    <!-- End Chat -->

    <!-- Footer -->
    <div class="bottom">
      <form>
        <input type="text" id="message" name="message" placeholder="Enter message..." autocomplete="off">
        <button type="submit">Send</button>
      </form>
    </div>
    <!-- End Footer -->

  </div>

  <script>
    // Broadcast messages
    $("form").submit(function (event) {
      event.preventDefault();

      // Stop empty messages
      if ($("form #message").val().trim() === '') {
        return;
      }

      // Disable form
      $("form #message").prop('disabled', true);
      $("form button").prop('disabled', true);

      $.ajax({
        url: "/chat",
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': "{{csrf_token()}}"
        },
        data: {
          "model": "gpt-3.5-turbo",
          "content": $("form #message").val()
        }
      }).done(function (res) {

        // Populate sending message
        $(".messages").append('<div class="right message">' +
          '<p>' + $("form #message").val() + '</p>' +
          '</div>');

        // Populate receiving message
        $(".messages").append('<div class="left message">' +
          '<p>' + res + '</p>' +
          '</div>');

        // Scroll to the latest message
        $(document).scrollTop($(document).height());

        // Cleanup
        $("form #message").val('');
        $("form #message").prop('disabled', false);
        $("form button").prop('disabled', false);
      });
    });
  </script>
</body>

</html>
