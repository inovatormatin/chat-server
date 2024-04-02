const OTP_TEMPLATE = (otp, userName) => {
  let currentDate = new Date();
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let formattedDate =
    currentDate.getDate() +
    " " +
    months[currentDate.getMonth()] +
    ", " +
    currentDate.getFullYear();
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Static Template</title>
  
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
    </head>
    <body
      style="
        margin: 0;
        font-family: 'Poppins', sans-serif;
        background: #ffffff;
        font-size: 14px;
      "
    >
      <div
        style="
          max-width: 680px;
          margin: 0 auto;
          padding: 45px 30px 60px;
          background: #221b44;
          background-image: url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0MauYbNGKFnBVeFJsgVGZ2zqC-oY2_3-fNJUqrJ3lxw&s);
          background-repeat: no-repeat;
          background-size: 800px 452px;
          background-position: bottom center;
          font-size: 14px;
          color: #434343;
        "
      >
        <header>
          <table style="width: 100%">
            <tbody>
              <tr style="height: 0">
                <td>
                  <img
                    alt=""
                    src="https://i.ibb.co/dfT5mvt/logo.webp"
                    style="height: auto; width: 30%"
                  />
                </td>
                <td style="text-align: right">
                  <span
                    id="todaysDate"
                    style="font-size: 16px; line-height: 30px; color: #ffffff"
                  >${formattedDate}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </header>
  
        <main>
          <div
            style="
              margin: 0;
              margin-top: 70px;
              padding: 92px 30px 115px;
              background: #ffffff;
              border-radius: 30px;
              text-align: center;
            "
          >
            <div style="width: 100%; max-width: 489px; margin: 0 auto">
              <h1
                style="
                  margin: 0;
                  font-size: 24px;
                  font-weight: 500;
                  color: #1f1f1f;
                "
              >
                Your OTP
              </h1>
              <p
                style="
                  margin: 0;
                  margin-top: 17px;
                  font-size: 16px;
                  font-weight: 500;
                "
              >
                Hi ${userName},
              </p>
              <p
                style="
                  margin: 0;
                  margin-top: 17px;
                  font-weight: 500;
                  letter-spacing: 0.56px;
                "
              >
                Thank you for choosing Friendly chat app. Use the following OTP to
                complete the procedure to verify your email address. OTP is valid
                for
                <span style="font-weight: 600; color: #1f1f1f">5 minutes</span>.
                Do not share this code with others, including Manish kumar
                Innovation employees.
              </p>
              <p
                style="
                  margin: 0;
                  margin-top: 60px;
                  font-size: 30px;
                  font-weight: 600;
                  letter-spacing: 25px;
                  color: #ea6769;
                "
              >
                ${otp}
              </p>
            </div>
          </div>
  
          <p
            style="
              max-width: 400px;
              margin: 0 auto;
              margin-top: 90px;
              text-align: center;
              font-weight: 500;
              color: #8c8c8c;
            "
          >
            Need help? Ask at
            <a
              href="mailto:inovatormatin@gmail.com"
              style="color: #221b44; text-decoration: none"
              >inovatormatin@gmail.com</a
            >
            or visit our
            <a
              href="instagram.com/ig_matin"
              target="_blank"
              style="color: #221b44; text-decoration: none"
              >Help Center</a
            >
          </p>
        </main>
  
        <footer
          style="
            width: 100%;
            max-width: 490px;
            margin: 20px auto 0;
            text-align: center;
            border-top: 1px solid #e6ebf1;
          "
        >
          <p
            style="
              margin: 0;
              margin-top: 40px;
              font-size: 16px;
              font-weight: 600;
              color: #434343;
            "
          >
            Manish kumar Innovation
          </p>
          <p style="margin: 0; margin-top: 8px; color: #434343">
            Address 540, Haryana, Gurugram.
          </p>
          <div style="margin: 0; margin-top: 16px">
            <a
              href="github.com/inovatormatin"
              target="_blank"
              style="display: inline-block"
            >
              <img
                width="36px"
                alt="Github"
                src="https://cdn1.iconfinder.com/data/icons/social-media-vol-2-1/24/_github_copy-64.png"
              />
            </a>
            <a
              href="instagram.com/ig_matin"
              target="_blank"
              style="display: inline-block; margin-left: 8px"
            >
              <img
                width="36px"
                alt="Instagram"
                src="https://cdn1.iconfinder.com/data/icons/social-media-rounded-corners/512/Rounded_Instagram_svg-128.png"
            /></a>
            <a
              href="https://twitter.com/inovatormatin"
              target="_blank"
              style="display: inline-block; margin-left: 8px"
            >
              <img
                width="36px"
                alt="Twitter"
                src="https://cdn1.iconfinder.com/data/icons/social-media-rounded-corners/512/Rounded_Twitter5_svg-128.png"
              />
            </a>
            <a
              href="https://www.linkedin.com/in/manish-kumar-09a114184/"
              target="_blank"
              style="display: inline-block; margin-left: 8px"
            >
              <img
                width="36px"
                alt="LinkedIN"
                src="https://cdn1.iconfinder.com/data/icons/social-media-rounded-corners/512/Rounded_Linkedin2_svg-128.png"
            /></a>
          </div>
          <p style="margin: 0; margin-top: 16px; color: #434343">
            Copyright © 2024 Company. All rights reserved.
          </p>
        </footer>
      </div>
    </body>
  </html>
  `;
};

module.exports = OTP_TEMPLATE;
