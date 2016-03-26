import React from 'react'
import { render } from 'react-dom'
import DashboardHeader from '../../Components/DashboardHeader.js'
import MarketingFooter from '../../Components/MarketingFooter.js'

export var recentProj = [
    { name:"Wemake Dahmoney Investments", },
    { name:"Gottakech Emall Partners", },
    { name:"Wallabalooza Bank", },
    { name:"Maken Amesup Izhard", },
]

export default React.createClass({
  
    render: function() {
        return (
            <div className="dashboard">
                <DashboardHeader/>  
                {this.props.children}
                <MarketingFooter/>
            </div>        
        );
    }
});
