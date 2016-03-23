/** @jsx React.DOM */

var recentProj = [
    { name:"Wemake Dahmoney Investments", },
    { name:"Gottakech Emall Partners", },
    { name:"Wallabalooza Bank", },
    { name:"Maken Amesup Izhard", },
]

var DashboardFrame = React.createClass({
  
    render: function() {
        return (
            <div className="dashboard">
                <DashboardHeader/>
            
                <this.props.activeRouteHandler/>
                
                <MarketingFooter/>
            </div>        
        );
    }
});
