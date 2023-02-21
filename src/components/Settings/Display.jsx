import { useContext } from "react";
import { useEffect, useState } from "react"
import { ColorContext } from "../../Contexts/ColorContext";
import { ThemeContext } from "../../Contexts/ThemeContext";

function Display() {
    const setTheme = useContext(ThemeContext)
    const setColor = useContext(ColorContext)
    const [fontSize, setFontSize] = useState(10)

    const handleSliderChange = (event) => {
        const sliderValue = parseInt(event.target.value, 10);
        const minFontSize = 0;
        const maxFontSize = 20;
        const step = 1;
        const valueRange = maxFontSize - minFontSize;
        const steps = valueRange / step;
        const stepSize = 100 / steps;
        const mappedValue = Math.round(sliderValue / stepSize) * stepSize;
        const clampedValue = Math.min(maxFontSize, Math.max(minFontSize, mappedValue));
        setFontSize(clampedValue);
    };

    const handleColor = (e) => {
        localStorage.setItem('color-tw', e.target.value)
        setColor(e.target.value)
    }

    const handleTheme = (e) => {
        localStorage.setItem('theme-tw', e.target.value)
        setTheme(e.target.value)
    }

    useEffect(() => {

    })

    return (
        <main className="main-setting">
            <h2 className="sticky">Display</h2>
            <p>Manage your font size, color, and background. These settings affect all the Twitter accounts on this browser.</p>

            <div className="tweet display">
                <div className="tweet-wrapper">
                    <div className="side-tweet">
                        <div className="tweet-profile-pic-wrapper">
                            <img className="tweet-profile-pic" src="https://pbs.twimg.com/profile_images/1013798240683266048/zRim1x6M_normal.jpg" alt="" />
                        </div>
                    </div>
                    <div className="main-tweet-content">
                        <div className="tweet-header">
                            <div className="tweet-username">Twitter</div>
                            <div className="tweet-usertag">@Twitter</div>
                        </div>
                        <div className="tweet-content">At the heart of Twitter are short messages called Tweets — just like this one — which can include photos, videos, links, text, hashtags, and mentions like <span className="tag">@Twitter</span></div>
                    </div>
                </div>
            </div>

            <div className="tweet display">
                <h2>Font Size</h2>
                <div className="slider-container">
                    <span className="small">Aa</span>
                    <div className="sliders">
                        <input type="range" min="0" max="20" step="1" value={fontSize} onChange={handleSliderChange} className='font-slider' />
                        <div className="slider-overlay">
                            <span className={fontSize === 0 ? "selected" : 0 < fontSize && 'past-selected'}></span>
                            <span className={fontSize === 5 ? "selected" : 5 < fontSize && 'past-selected'}></span>
                            <span className={fontSize === 10 ? "selected" : 10 < fontSize && 'past-selected'}></span>
                            <span className={fontSize === 15 ? "selected" : 15 < fontSize && 'past-selected'}></span>
                            <span className={fontSize === 20 && "selected"}></span>
                        </div>
                        <div className="visible-track" style={{ transform: `scaleX(${fontSize / 20}) translateY(-50%)` }}></div>
                        <div className="invisible-track"></div>
                    </div>
                    <div className="big">Aa</div>
                </div>
            </div>

            <div className="tweet display">
                <h2>Color</h2>
                <div className="colors">
                    <label htmlFor="blue" className="blue">
                        <input type="radio" name="color" id="blue" value='blue-color' onChange={handleColor}/>
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="color-svg"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                    </label>
                    <label htmlFor="yellow" className="yellow">
                        <input type="radio" name="color" id="yellow" value='yellow-color' onChange={handleColor} />
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="color-svg"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                    </label>
                    <label htmlFor="pink" className="pink">
                        <input type="radio" name="color" id="pink" value='pink-color' onChange={handleColor} />
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="color-svg"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                    </label>
                    <label htmlFor="purple" className="purple">
                        <input type="radio" name="color" id="purple" value='purple-color' onChange={handleColor} />
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="color-svg"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                    </label>
                    <label htmlFor="orange" className="orange">
                        <input type="radio" name="color" id="orange" value='orange-color' onChange={handleColor} />
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="color-svg"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                    </label>
                    <label htmlFor="green" className="green">
                        <input type="radio" name="color" id="green" value='green-color' onChange={handleColor}/>
                        <svg viewBox="0 0 24 24" aria-hidden="true" class="color-svg"><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                    </label>
                </div>
            </div>

            <div className="tweet display">
                <h2>Background</h2>
                <div className="themes">
                    <label htmlFor="default" className="default">
                        <input type="radio" name="theme" id="default" value='default' onChange={handleTheme} />
                        <div className="svg-theme">
                            <svg viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                        </div>
                        <span>Default</span>
                    </label>
                    <label htmlFor="dim" className="dim">
                        <input type="radio" name="theme" id="dim" value='dim' onChange={handleTheme} />
                        <div className="svg-theme">
                            <svg viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                        </div>
                        <span>Dim</span>
                    </label>
                    <label htmlFor="lightsOut" className="lights-out">
                        <input type="radio" name="theme" id="lightsOut" value='lights-out' onChange={handleTheme} />
                        <div className="svg-theme">
                            <svg viewBox="0 0 24 24" aria-hidden="true" ><g><path d="M9.64 18.952l-5.55-4.861 1.317-1.504 3.951 3.459 8.459-10.948L19.4 6.32 9.64 18.952z"></path></g></svg>
                        </div>
                        <span>Lights Out</span>
                    </label>
                </div>
            </div>
        </main>
    )
}

export default Display