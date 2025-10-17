import React from 'react'
import Navbar from '../../Components/Navbar/Navbar'
import Footer from '../../Components/Footer/Footer'
import ImageThree from '../../assets/third_image.png'
import ImageOne from '../../assets/first_image.png'
import ImageTwo from '../../assets/second_image.png'
import "./CheckOutPage.css"
function CheckOutPage() {
  return (
    <>
    <div className="image_and_price_amount">
        <div className="image_wrapper">
            <img className="image_three" src={ImageThree}/>
            <img className="image_three" src={ImageOne}/>
            <img className="image_three" src={ImageTwo}/>
        </div>
        <div className="price_and_amount_wrapper">
            <p className="skin_me">SKIN.ME</p>
            <p className="font_word">Hydrating Cream</p>
            <p className="font_word">9.99$</p>
            <div className="plus_minus_wrapper">
                <p className="font_word plus_minus k">-</p>
                <p className="font_word plus_minus">1</p>
                <p className="font_word plus_minus k">+</p>
            </div>
            <div className="buy_now_wrapper">
                <p className="buy_now">Buy Now</p>
            </div>
            <div className="lorem">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum facilis blanditiis praesentium doloremque voluptatibus est reprehenderit unde, suscipit modi qui optio commodi quisquam veniam eaque fugiat repudiandae voluptas tempore ex?</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci excepturi doloribus nesciunt accusamus voluptate id accusantium saepe ducimus nam expedita. Quas, sapiente asperiores. Nulla aperiam officiis culpa suscipit. Aliquam, ut?</p>
            </div>
        </div>
        
        </div>
        <Navbar/>
        <Footer/>
    </>
  )
}

export default CheckOutPage