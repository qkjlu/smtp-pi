import React from 'react'
import AddWorkSiteForm from "./Worksite/AddWorkSiteForm";

export default class ButtonAdminSelected extends React.Component {
    render() {
        if(this.props.index == 0){
            return <AddWorkSiteForm onReload={this.props.onReload} unShowForm={this.props.unShowForm}/>;
        }else if(this.props.index == 1){
            return null;
        }else if(this.props.index == 2){
            return null;
        }else
            return null;
    }
}