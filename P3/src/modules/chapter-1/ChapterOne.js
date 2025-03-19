import React, { Component } from 'react'
import MessegersUI from './widgets/messagers/MessegersUI'
export default class ChapterOne extends Component {
    render() {
        return (
            <div className='container'>
                <h1 className='text-black text-center mb-5'>
                    Chapter one: The messengers
                </h1>
                <MessegersUI />
            </div>
        )
    }
}