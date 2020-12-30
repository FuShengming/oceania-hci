package simpleFactory;
//演示简单工厂
public class SimpleFactory {
	public static void main(String[] args) throws Exception{
		Factory factory = new Factory();
		factory.produce("PRO5").run();
		factory.produce("PRO6").run();
	}
}
