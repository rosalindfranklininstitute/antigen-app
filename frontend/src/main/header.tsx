function Header(props: { logo: string, title: string }) {
    return (
        <header className='row'>
            <div className='col-md-2'>
                <img src={props.logo} className="logo" alt="logo"></img>
            </div>
            <div className='col-md-10 mt-3'>
                {props.title}
            </div>
        </header>
    );
};

export { Header };
