## Basic Blocks

### Paragraph

This is a simple paragraph

This is a **bolded** paragraph

This is a _italized_ paragraph

This is a _**bolded and italized**_ paragraph

This is a [linked](http://www.google.com/) paragraph

This is a $\text{mathed}$ paragraph

This is a `coded` paragraph

### Heading

#### This is a simple heading

#### This is a **bolded** heading

#### This is a _italized_ heading

#### This is a _**bolded and italized**_ heading

#### This is a ~~striked~~ heading

#### This is a [linked](http://www.google.com/) heading

#### This is a $\text{mathed}$ heading

#### This is a `coded` heading

### Code

```json
{
  //...other keys excluded
  "type": "code",
  //...other keys excluded
  "code": {
   	"caption": [],
 		"rich_text": [{
      "type": "text",
      "text": {
        "content": "const a = 3"
      }
    }],
    "language": "javascript"
  }
}
```

### Quote

> This is a simple quote

> This is a **bolded** quote

> This is a parent quote
>
> > With an inner quote
>
> And another paragraph

### Math

$$
\text{This is a math equation}
$$

$$
x_1, x_2 = \frac{-b \pm \sqrt{c^2 - 4ac}}{2}
$$

### Tables

| Col 1           | Col 2       |
| --------------- | ----------- |
| Col 1 **Row** 1 | Col 2 Row 1 |
| Col 1 _Row_ 3   | Col 2 Row 3 |

### Callout

> [!note]
> This is a simple Callout

> [!note]
> This is a **bolded** Callout

> [!note]
> This is a parent Callout…
>
> > [!note]
> > With an inner Callout!
>
> And a paragraph

## Lists

### Toggles

* This is a simple toggle

* This is a **bolded** toggle

* This is a parent toggle

  * With an inner toggle

  And another paragraph

* #### This is a heading toggle

  With an inner paragraph

* With a bullet point ahead

### Dividers

I am before a divider

***

I am after a divider

***

***

I am after two dividers

### Bulleted Lists

* This is a simple item

* This is a **bolded** item

* This is a parent item

  * With an inner item

  And another paragraph

### Numbered Lists

* This is a simple item

* This is a **bolded** item

* This is a parent item

  * With an inner item

  And another paragraph

### Todo Lists

* [ ] This is a simple item

* [x] This is a **bolded** item

* [ ] This is a parent item

  * [x] With an inner item

  And another paragraph

### Mixed Lists

* This is an unordered item

* This is an ordered item

* [ ] This is a todo item

  * With an inner unordered item

* This is an ordered item (again)

  * [x] With an inner todo item

## Links

<https://www.youtube.com/>

[CV Julian Gonzalez Calderon (en).pdf](https://prod-files-secure.s3.us-west-2.amazonaws.com/d4d5bb19-88f8-434c-a8f6-02428c700a6d/c2f47965-689d-4579-a5f0-3371e886ee15/CV_Julian_Gonzalez_Calderon_%28en%29.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256\&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD\&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240123%2Fus-west-2%2Fs3%2Faws4_request\&X-Amz-Date=20240123T165507Z\&X-Amz-Expires=3600\&X-Amz-Signature=543dc2c2f5851b1f8c272dc902ffa2182f1a43af96373b5f56cd6fbab1b4a218\&X-Amz-SignedHeaders=host\&x-id=GetObject)

![Spirit Galopando](https://prod-files-secure.s3.us-west-2.amazonaws.com/d4d5bb19-88f8-434c-a8f6-02428c700a6d/381d99c0-e3c0-45a0-98a9-56e1075c64bc/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256\&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD\&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240123%2Fus-west-2%2Fs3%2Faws4_request\&X-Amz-Date=20240123T165508Z\&X-Amz-Expires=3600\&X-Amz-Signature=786183184a1f594317e03e7ad0f8f406fda2c3728e56ed023dd3ac0d54d1ef38\&X-Amz-SignedHeaders=host\&x-id=GetObject)

![](https://prod-files-secure.s3.us-west-2.amazonaws.com/d4d5bb19-88f8-434c-a8f6-02428c700a6d/8613a46d-9d31-4e63-9011-b9a811b50d07/CV_Julian_Gonzalez_Calderon_%28en%29.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256\&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD\&X-Amz-Credential=AKIAT73L2G45HZZMZUHI%2F20240123%2Fus-west-2%2Fs3%2Faws4_request\&X-Amz-Date=20240123T165508Z\&X-Amz-Expires=3600\&X-Amz-Signature=b80b6057f36aee7c8628ab369315505135a8b61be7e94c1828f7d355a0b9b27b\&X-Amz-SignedHeaders=host\&x-id=GetObject)

![We are Number One!](https://www.youtube.com/watch?v=zt0Un7OVPjE\&list=LL\&index=168)

![Museo Nacional de Bellas Artes](https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13138.566325268608!2d-58.38310044999999!3d-34.5879346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaa199c2f643%3A0x49e543b8331abe7d!2sMuseo%20Nacional%20de%20Bellas%20Artes!5e0!3m2!1ses-419!2sar!4v1705965886253!5m2!1ses-419!2sar)

## Containers

I am a synced block

> With an inner quote

I am a synced block

> With an inner quote
