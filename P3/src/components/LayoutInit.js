import Footers from "./Footers";
import Headers from "./Headers";
const LayoutInit = ({ children }) => {
    return (
        <div className="">
            <div className="">
                <div className="">
                    <Headers />
                    <section className="">
                        <div className="">
                            {children}
                        </div>
                    </section>
                    <Footers />
                </div>
            </div>
        </div>
    );
};
export default LayoutInit;