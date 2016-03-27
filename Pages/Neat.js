import React from 'react'
import PageLanding from './PageLanding'
import MarketingFooter from './MarketingFooter'

export default React.createClass({
  render(){
    return <div className="container">
              <div className="row">
                 I am a Neat Menu!
               </div>
               <PageLanding/>
               <MarketingFooter/>
           </div>
  }
})
