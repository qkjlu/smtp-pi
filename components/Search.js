import React from 'react'
import {TextInput } from 'react-native'
import style from '../Style'
export default class Search extends React.Component {
    render() {
        return (
            <TextInput style = { style.input }/>
        )
    }
}