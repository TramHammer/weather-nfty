# weather-ntfy
ntfy notification push with api.weather.gov

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites
1. Get [Node.js LTS](https://nodejs.org/en)
### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Clone the repo
   ```sh
   git clone https://github.com/TramHammer/weather-ntfy
   ```
   or download the [repo](https://github.com/TramHammer/weather-ntfy/releases/new)
2. Install packages
   ```sh
   npm install node-cron node-fetch express
   ```
3. Docker 
   Docker Compose
   ```yml
      version: '3.4'
   
   services:
     weatherntfy:
       image: weatherntfy
       build:
         context: .
         dockerfile: ./Dockerfile
       environment:
         NODE_ENV: production
       ports:
         - 5823:5823

   ```
   or Docker
   ```sh
   docker run --rm -d -p 5823:5823/tcp weatherntfy:latest 
   ```

<!-- USAGE EXAMPLES -->
## How to use

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

1. Update `main.js`
   1. `lat` - This should be the latitude of the location - should be rounded to the 4th decimal place
   2. `long` - This should be the longitude of the location - should be rounded to the 4th decimal place
   3. `topic` - This should the nfty topic link in full
   4. `pushMobileErrors` - This is if you want to see server errors pushed in the same nfty channel 
   5. `shortAlerts` - This if you want the full alert description in your notification(this will not load the entire description depending on the length of the alert)
   6. Update node-chron to push notifications when you want to
4. Run 
   ```sh
   docker run --rm -d -p 5823:5823/tcp weatherntfy:latest
   ```
   or run 
   ```sh
   node . 
   ```

_For more examples, please refer to the [Documentation](https://example.com)_



<!-- ROADMAP -->
## Roadmap
- [x] NWS Alerts Push
- [ ] NOAA Products API integration

See the [open issues](https://github.com/TramHammer/weather-ntfy/issues) for a full list of proposed features (and known issues).


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.



<!-- CONTACT -->
## Contact

TramHammer - [@](@TramHammer) - email@example.com

Project Link: [https://github.com/TramHammer/weather-ntfy](https://github.com/TramHammer/weather-ntfy)

