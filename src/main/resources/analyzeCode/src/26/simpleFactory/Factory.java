package simpleFactory;

//工厂
public class Factory{
	MeizuPhone produce(String product) throws Exception{
		if(product.equals("PRO5"))
			return new PRO5();
		else if(product.equals("PRO6"))
			return new PRO6();
		throw new Exception("No Such Class");
	}
}