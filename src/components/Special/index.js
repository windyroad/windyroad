import React from 'react'
import Link from 'gatsby-link'


class Special extends React.Component {
      render() {
        
        return 				<section id="five" className="wrapper style2 special fade">
        <div className="container">
            <header>
                <h2>Magna faucibus lorem diam</h2>
                <p>Ante metus praesent faucibus ante integer id accumsan eleifend</p>
            </header>
            <form method="post" action="#" className="container 50%">
                <div className="row uniform 50%">
                    <div className="8u 12u$(xsmall)"><input type="email" name="email" id="email" placeholder="Your Email Address" /></div>
                    <div className="4u$ 12u$(xsmall)"><input type="submit" value="Get Started" className="fit special" /></div>
                </div>
            </form>
        </div>
    </section>
    }
}


export default Special
